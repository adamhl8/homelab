# homelab

Infrastructure as code for the Incus host and everything running on it.

## Bootstrap chain

Everything derives from one passphrase, kept in your head:

```
passphrase
  -> secrets/key.age                     (scrypt-encrypted age identity, committed)
      -> ~/.config/sops/age/keys.txt     (decrypted by bootstrap.sh, never committed)
          -> sops
              -> secrets/ssh.yaml        SSH keys (private included)
              -> secrets/credentials.yaml    API keys, passwords
```

The layers build on each other, bottom up. Each one can only run once the one below it
exists:

| Layer                 | Owns                                                                  | Auth it uses       |
| --------------------- | --------------------------------------------------------------------- | ------------------ |
| `bootstrap.sh`        | homebrew, the clone, the decrypted age identity                       | **the passphrase** |
| `hosts/macbook.ts`    | this macbook: brew packages, dotfiles, SSH keys, macOS settings       | age identity       |
| `metal/`              | bare Debian on the host                                               | KVM console        |
| `hosts/` (incus host) | ZFS, networking, the Incus daemon, Tofu's client cert                 | SSH key            |
| `tofu/`               | everything inside the Incus API: pools, profiles, networks, instances | Incus client cert  |
| `hosts/` (containers) | packages, files, services, compose stacks                             | SSH key            |

`bootstrap.sh`, `hosts/macbook.ts`, `metal/`, and `tofu/` are real. The incus host and container
layers aren't written yet. Until they are, `incus/` holds the manual runbooks and configs for them.

`hosts/` holds one [tsinfra](https://github.com/adamhl8/tsinfra) script per machine. tsinfra only
loads the `.ts` files directly in `hosts/`, so everything else lives in folders: the integrations
(the code that gets a host to a state) in `hosts/integrations/`, a host's larger inputs (what it
wants, like its brew packages) in a folder named after it (`hosts/macbook/`), and other shared
helpers in `hosts/lib/`. Integrations work on macOS and Linux, branching on the host's platform
where they differ. The ones with no Linux equivalent, like the Dock and `defaults`, live in
`hosts/integrations/macos/`. The files hosts link to live in `hosts/files/` when they're shared, and in
`hosts/<host>/files/` when only one host uses them.

```sh
bask plan macbook    # dry-run, with diffs
bask apply macbook
```

## Bootstrapping a machine from nothing

One command, and one passphrase:

```sh
curl -fsSL https://raw.githubusercontent.com/adamhl8/homelab/main/bootstrap.sh | sh
```

That is the whole manual surface. `bootstrap.sh` is safe to re-run, and it does only the four
things that have to happen before tsinfra can take over:

1. **Install homebrew.** Its installer also installs the Xcode Command Line Tools, which is
   where `git` actually comes from, so it is a strict superset of `xcode-select --install`.
2. **Clone this repo over HTTPS.** It has to be HTTPS: a `git@` clone needs the SSH key, and
   the SSH key lives inside the repo being cloned. This works only because the repo is public.
   `hosts/macbook.ts` flips `origin` back to SSH once it has written the key.
3. **`brew install bun sops age`, then `bun install`.** Only what tsinfra needs to run. Every other
   package is declared in `hosts/macbook/brew.ts`, which the macbook host applies, so that list stays
   the single source of truth.
4. **Decrypt `secrets/key.age`** to `~/.config/sops/age/keys.txt`, which prompts for the
   passphrase.

Step 4 is the only step that cannot be code, and it is the reason bootstrap exists at all. The
passphrase is the one input to this entire system that isn't in git. It also can't be folded
into tsinfra, because `hosts/macbook.ts` decrypts its sudo password with sops when tsinfra _loads_
it: the key has to be on disk before tsinfra starts, so tsinfra can never be the thing that puts it
there.

Everything downstream is a pure function of (passphrase + repo). A wiped machine is recoverable
with nothing but this command and something you remember.

### What layer -1 does not cover

**`aws sso login --profile adamhl8`.** The AWS profile authenticates through SSO, so its
credentials are a session token minted in a browser, not a key on disk. The macbook host writes
`~/.aws/config` so the profile _exists_, which is what matters structurally: the base bask tofu
tasks are gated behind `aws configure list-profiles` listing `adamhl8` and **silently
do nothing** when that check fails. Without the profile, `bask tofu-check` plans nothing and
still exits clean.

**Your passphrase is the whole vault.** `secrets/key.age` is committed to a _public_ repo, so
the scrypt-encrypted identity and every ciphertext in `credentials.yaml` are world-readable. That
is what age's scrypt mode is designed for, but it means the security of everything reduces to
how well your passphrase resists offline grinding by someone who has cloned the repo. It wants
to be a long diceware phrase, not a good password.

## Layer -1: this macbook

`hosts/macbook.ts` owns the machine you run everything else _from_. It targets `@local`, so run
`bask plan macbook` before every `bask apply macbook`: `@local` pointed at `$HOME` means a careless
file step overwrites real state with no undo.

It manages:

- **Brew packages**, listed in `hosts/macbook/brew.ts`. The brew integration turns the list into a
  Brewfile and sends it to `brew bundle` on stdin.
- **SSH keys**, written from `secrets/ssh.yaml`. Both the private and public halves are in the
  vault, so a fresh machine gets a working `git commit` and `ssh incus.lan` with no key ceremony.
- **The AWS profile**, `~/.aws/{config,credentials}`.
- **Dotfiles**: the shared base from `hosts/files/` (used by every host, e.g. the coming WSL one)
  plus macbook-only extras from `hosts/macbook/files/`, linked into `$HOME`.
- **macOS settings**: the hostname, `defaults`, file handlers, the Dock, power, the wallpaper, and
  fonts.
- **fish** as the login shell, with the fisher plugins in `hosts/files/fish_plugins`.

The dotfiles are symlinks into the repo, so an edit on either side is the same edit: when an app
changes its config, the change shows up in `git diff`. The wallpaper is set straight to the repo's
image, because Finder reports a symlink's target. Files generated on the host stay real files, like
the SSH keys and `conf.d/homebrew.fish`.
A link has no mode of its own, so the files integration sets each source's mode in the repo: 644 by
default, 755 for the bin scripts, and 600 where `hosts/macbook/dotfiles.ts` says so. A new file gets
fixed on the next apply, whatever mode you created it with.
Some apps save by writing a new file over the old one, which turns a link back into a regular file.
A link step then fails instead of replacing the file, so the app's edits aren't lost. Copy the file
into the repo, delete it, and apply to put the link back.
Zed's settings are a shared source (`hosts/files/zed/settings.json`) with a per-host destination, since it
differs per host: the macbook links it at `~/.config/zed/settings.json`, and the WSL host will map
the same source to `/mnt/c/Users/<winuser>/AppData/Roaming/Zed/settings.json` (Zed runs
Windows-side there and remotes into WSL). That mapping has to be a file copy, because a link there
would point into WSL's filesystem, which Windows-side Zed can't follow. It should also leave out
`mode`: chmod on a default drvfs mount is a no-op, so a managed mode would report drift every run.
The `zed/settings.json` source path is deliberate: Zed's builtin schema association matches
any path ending in `zed/settings.json`, so the repo copy gets settings autocomplete for free.

One more ordering constraint is load-bearing: the **SSH keys are written before `.gitconfig`**.
That config sets `commit.gpgsign = true` with `~/.ssh/id_ed25519.pub` as the signing key, so
writing it first would break every `git commit` on the machine until the key showed up.

Brew converges in both directions: apply installs what the package list names, and runs
`brew bundle cleanup --force` on anything installed outside them. `bask plan macbook` lists both
before anything is installed or removed.

## Bare-metal Debian install

`metal/` installs Debian 13 on the host unattended. There is no custom ISO: the stock
Debian netinst boots, and `metal/preseed.cfg` is fetched over HTTP at install time via the
`url=` boot parameter.

`metal/serve.ts` renders the preseed (filling in the SSH pubkey and console password from
sops, in memory, so no plaintext secret ever hits disk) and serves it on port 8000. It prints
the exact boot line to type, with your machine's LAN IP already filled in.

### Choosing the disk is the one interactive step

The four SATA disks (`sda`-`sdd`) are a 3.27T raidz1 (`nas`). Picking one of them destroys it.

`partman-auto/disk` is deliberately **not** preseeded, which makes d-i stop and show its
`Select disk to partition` dialog. It lists every disk with its size and model, so the 233G
NVMe is easy to tell apart from four 1.8T WD Reds. `serve.ts` prints which one to choose.

This is the only question the install asks, and it is the right one to keep. Automating it
means encoding a rule about which device is the boot disk, and every such rule can be wrong:
device enumeration is not stable (a second NVMe shifts `nvme0n1`), and a rule that is wrong
fails by silently repartitioning 3.27T of data. A human reading "233G WD_BLACK" off a list
cannot make that mistake.

Automating it and _verifying_ by serial was the previous design. It failed badly in two ways
that are worth remembering:

- **It cannot be verified beforehand.** There is no OS to check the serial from, and GRUB is
  no help — it can list devices and sizes but cannot read serial numbers, and its
  `(hd0)`/`(hd1)` numbering comes from UEFI, which does not map to Linux device names.
- **It fails invisibly.** A guard that halts inside `partman/early_command` cannot report why:
  d-i's ncurses UI paints over anything written to the console, so the install just hangs at
  `Starting up the partitioner` with no explanation. (If you ever need to see what d-i is
  really doing, **Alt-F4** is its syslog and **Alt-F2** is a shell.)

Because the disk is chosen at partition time, `grub-installer/bootdev` is `default`, which
means "whatever disk partman just used" — the only device we know at that point.

### Install

1. Download the current Debian 13 amd64 netinst ISO from
   [cdimage.debian.org](https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/) and
   verify it against `SHA256SUMS`.
2. Upload it to JetKVM storage (Mount Drive -> Storage). Uploading first is the fastest
   option, since it then runs at local USB 2.0 speed rather than streaming.
3. Set drive mode to **CD/DVD**, then mount the image.
4. On your machine, start the preseed server:

   ```sh
   bun metal/serve.ts
   ```

5. Boot the host. At the GRUB menu press `e`, find the line starting `linux`, and append
   the boot parameters `serve.ts` printed:

   ```
   auto=true priority=critical interface=enp6s0 hostname=incus domain=lan url=http://<your-machine>:8000/preseed.cfg
   ```

   Then `Ctrl-X` to boot.

6. It installs unattended and reboots into `incus.lan` (10.8.8.2) with your SSH key already
   in place. Unmount the virtual media so it does not boot the installer again.

Then hand off to the incus host's tsinfra script.

### What the install leaves you

Deliberately close to nothing: a booting Debian with `adam`, your SSH key, and a locked root
account. Everything else (ZFS, bridge networking, Incus) belongs to the host's tsinfra script, so that host
config stays convergent rather than frozen into an install-time decision.

`late_command` therefore only installs the SSH key, and does it entirely through `in-target`,
which chroots into the new system. The one wrinkle is that the key has to be written by
`in-target sh -c "echo ... > ..."` rather than a bare `in-target echo ... > ...`: the
redirect is performed by the _installer's_ shell before `in-target` ever runs, so the latter
would silently write the key into the installer's ramdisk and throw it away at reboot.

There is no `sudoers` file here either. d-i adds the first user to the `sudo` group whenever
root login is disabled, so `adam` can already escalate with the password from sops. The host's
tsinfra script uses that on its first run and installs passwordless sudo itself.

### What `auto=true` and `priority=critical` do

`auto=true` is shorthand for `auto-install/enable=true`. It defers the locale and keyboard
questions until _after_ the preseed has been fetched, which is the only reason those two can
live in the file rather than on the boot line. It does **not** defer network configuration,
which is what shapes the two sections below.

`priority=critical` is shorthand for `debconf/priority=critical`. Every d-i question carries
a priority, and this raises the threshold to the highest one, so only `critical` questions
are shown — and almost nothing in d-i is critical. An interactive install runs at `high`.

The important part is what happens to the questions it skips: **they are not skipped, they
are answered with their default.** debconf never stalls, it just takes the template's
`Default:` unless something preseeded a value. So `priority=critical` is what makes the
install unattended, but it does nothing to make it _correct_ — correctness comes entirely
from the preseed and the boot-line answers.

This is why every default we depend on had to be checked rather than assumed. Without
`hostname=incus`, `netcfg/get_hostname` (a `high` question) is not raised for us to answer;
it is quietly resolved to its template default, which is the literal string `debian`, and
the install "succeeds".

### Why there are no `netcfg/*` settings in the preseed

From the [Debian install guide](https://www.debian.org/releases/trixie/amd64/apbs04.en.html):

> Of course, preseeding the network configuration won't work if you're loading your
> preconfiguration file from the network.

By the time d-i fetches the preseed over HTTP, the network is already configured. Any
`netcfg/*` line in the file arrives too late and is silently ignored. So both `netcfg`
answers we care about go on the boot line instead, using the
[documented short aliases](https://www.debian.org/releases/trixie/amd64/apbs02.en.html)
(`interface` is `netcfg/choose_interface`, `hostname` is `netcfg/get_hostname`).

### Why the hostname has to be set explicitly

The running host does get `HOSTNAME=incus` in its DHCP lease, which makes it look like the
server hands out the name and d-i would pick it up for free. It does not. Unifi's entry for
this client is:

```json
"name": "incus 4a:bc",
"macAddress": "04:7c:16:10:4a:bc"
```

That is Unifi's _auto-generated_ name (announced hostname plus MAC suffix), not a
configured alias. The hostname originates from the **client**: the installed system
announces `incus` over DHCP, Unifi records it, registers `incus.lan`, and echoes it back as
option 12. The lease only carries the name because the machine already had one.

A fresh install has no hostname to announce, so it would come up as `debian` — and Unifi
would then re-register `debian.lan` for 10.8.8.2 and `incus.lan` would stop resolving. That
breaks `ssh adam@incus.lan` and everything downstream of it.

`hostname=incus` on the boot line answers the question before `netcfg` asks, so d-i writes
`/etc/hostname` and the `127.0.1.1 incus.lan incus` line in `/etc/hosts` itself. The
installer's own default for that question is the literal string `debian`.

`domain=lan` is pinned for the same reason, though it is the weaker case. `DOMAINNAME=lan`
is option 15, configured on the Unifi network and pushed to clients, and a client cannot
announce a domain, so unlike the hostname it really is server-originated. But its template
default is empty and `priority=critical` never prompts, so if it ever failed to arrive the
install would silently produce `127.0.1.1 incus` with no FQDN. Ten characters buys
independence from the router's config.

`netcfg/target_network_config` is deliberately _not_ pinned. It decides whether d-i writes
`/etc/network/interfaces`, netplan, or NetworkManager config, which matters because the host's
tsinfra script migrates away from ifupdown. But `ifupdown` is `Priority: important` (so the `standard` task
always installs it) while `network-manager` is only `optional` and `netplan.io` is never
installed, so netcfg has one real candidate and picks it. This is an assumption the host
script relies on rather than one the boot line enforces.

The interface is therefore the only thing on the boot line, which keeps it short enough to
type without a typo.

### Why the interface is `enp6s0`

At install time the host shows three ethernet NICs, and **all three are on 10.8.8.0/24 and
will take a DHCP lease**. A wrong choice installs cleanly and only fails later, which makes
this worth pinning deliberately:

| NIC      | Role once the host script has run                               | Host IP         |
| -------- | --------------------------------------------------------------- | --------------- |
| `enp3s0` | enslaved to `br0`, the container bridge uplink                  | none            |
| `enp4s0` | moved into the qbittorrent container (Incus `physical` network) | none            |
| `enp6s0` | the host's own uplink: DHCP reservation, default route          | **10.8.8.2/24** |

`enp3s0` has to stay address-less. The host script enslaves it to `br0`, whose `.network` file
carries an empty `Address=`, so a host holding its only IP there would cut itself off the
instant the bridge came up. `enp4s0` has to stay free for Incus to hand to qbittorrent.
Only `enp6s0` carries the DHCP reservation for 10.8.8.2, which is what `incus.lan` resolves
to and what Tofu talks to on port 8000.

Because the reservation lands the box on 10.8.8.2 with your SSH key already installed, no
console step is needed after the install: no static IP, no editing
`/etc/network/interfaces`, no second KVM session.

## Free My TV on the living room TV

`tv/` builds [Free My TV](https://github.com/simbasjungles/free-my-tv), an ad-free home screen
for the TCL Google TV, and installs it over adb:

```sh
bask tv-build       # build only
bask tv-build -i    # build, then install on Living-Room-TV.lan
```

`tv/build.ts` checks out upstream at the commit pinned in `UPSTREAM_REV` into
`~/.cache/free-my-tv`, writes `tv/config.properties` there with the TMDB key appended, and runs
upstream's `build.sh`. Bump `UPSTREAM_REV` to update.

Local changes live in `tv/patches/*.patch`, applied in name order on top of a clean checkout.
`hide-live-tv.patch` adds a `hide_live_tv` setting that drops the Live TV entry from the
shortcuts row and the drawer (the TV always reports a tuner, and its Live TV app also plays
HDMI, so the TV side can't hide it). A patch that no longer applies after a bump fails the
build, so regenerate it with `git diff` in `~/.cache/free-my-tv`.

The JDK and Android tools come from the macbook's brew packages (`openjdk@17`,
`android-commandlinetools`, `android-platform-tools`). The script installs the SDK packages
upstream's CI builds with (`build-tools;34.0.0`, `platforms;android-34`) through `sdkmanager`.

Two secrets live in `credentials.yaml`: `tmdb_api_key` and `free_my_tv_keystore` (the signing
keystore, base64). **The keystore is what makes this reproducible.** Android refuses an update
signed by a different key, so a fresh keystore would mean uninstalling the app and redoing the
setup on the TV. The checkout is outside the repo because it holds both secrets in plaintext.

The TV drops off the network when it sleeps, so wake it before `bask tv-build -i`.
