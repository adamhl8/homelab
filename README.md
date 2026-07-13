# homelab

Infrastructure as code for the Incus host and everything running on it.

## Bootstrap chain

Everything derives from one passphrase, kept in your head:

```
passphrase
  -> configs/key.age            (scrypt-encrypted age identity, committed)
      -> sops
          -> configs/ssh.yaml       SSH key
          -> configs/secrets.yaml   API keys, passwords
```

The layers build on each other, bottom up. Each one can only run once the one below it
exists:

| Layer                  | Owns                                                                  | Auth it uses      |
| ---------------------- | --------------------------------------------------------------------- | ----------------- |
| `metal/`               | bare Debian on the host                                               | KVM console       |
| `pyinfra/` (host)      | ZFS, networking, the Incus daemon, Tofu's client cert                 | SSH key           |
| `tofu/`                | everything inside the Incus API: pools, profiles, networks, instances | Incus client cert |
| `pyinfra/` (container) | packages, files, services, compose stacks                             | SSH key           |

`metal/` and `tofu/` are the only ones with anything real in them so far. `pyinfra/` is a
skeleton.

`pyinfra/` is a self-contained uv project, so run it from there:

```sh
cd pyinfra
uv run pyinfra inventory.py deploy.py
```

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

Then hand off to pyinfra.

### What the install leaves you

Deliberately close to nothing: a booting Debian with `adam`, your SSH key, and a locked root
account. Everything else (ZFS, bridge networking, Incus) belongs to pyinfra, so that host
config stays convergent rather than frozen into an install-time decision.

`late_command` therefore only installs the SSH key, and does it entirely through `in-target`,
which chroots into the new system. The one wrinkle is that the key has to be written by
`in-target sh -c "echo ... > ..."` rather than a bare `in-target echo ... > ...`: the
redirect is performed by the _installer's_ shell before `in-target` ever runs, so the latter
would silently write the key into the installer's ramdisk and throw it away at reboot.

There is no `sudoers` file here either. d-i adds the first user to the `sudo` group whenever
root login is disabled, so `adam` can already escalate with the password from sops. pyinfra
uses that on its first run and installs passwordless sudo itself.

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
`/etc/network/interfaces`, netplan, or NetworkManager config, which matters because pyinfra
migrates away from ifupdown. But `ifupdown` is `Priority: important` (so the `standard` task
always installs it) while `network-manager` is only `optional` and `netplan.io` is never
installed, so netcfg has one real candidate and picks it. This is an assumption pyinfra
relies on rather than one the boot line enforces.

The interface is therefore the only thing on the boot line, which keeps it short enough to
type without a typo.

### Why the interface is `enp6s0`

At install time the host shows three ethernet NICs, and **all three are on 10.8.8.0/24 and
will take a DHCP lease**. A wrong choice installs cleanly and only fails later, which makes
this worth pinning deliberately:

| NIC      | Role once pyinfra has run                                       | Host IP         |
| -------- | --------------------------------------------------------------- | --------------- |
| `enp3s0` | enslaved to `br0`, the container bridge uplink                  | none            |
| `enp4s0` | moved into the qbittorrent container (Incus `physical` network) | none            |
| `enp6s0` | the host's own uplink: DHCP reservation, default route          | **10.8.8.2/24** |

`enp3s0` has to stay address-less. pyinfra enslaves it to `br0`, whose `.network` file
carries an empty `Address=`, so a host holding its only IP there would cut itself off the
instant the bridge came up. `enp4s0` has to stay free for Incus to hand to qbittorrent.
Only `enp6s0` carries the DHCP reservation for 10.8.8.2, which is what `incus.lan` resolves
to and what Tofu talks to on port 8000.

Because the reservation lands the box on 10.8.8.2 with your SSH key already installed, no
console step is needed after the install: no static IP, no editing
`/etc/network/interfaces`, no second KVM session.
