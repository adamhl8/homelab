# todo

manage npmrc, extract secret using sops
check commit history for anything missed

High-level plan. `bootstrap.sh` + `hosts/macbook.ts` (layer -1) and `metal/` (layer 0) are
done. Layer -1 has been applied for real (2026-07-21): the old repo symlinks are gone, the
deploy owns the machine's dotfiles/keys/AWS profile as plain files, and a fresh login shell
sources its config and decrypts the vault from `~/homelab/secrets/credentials.yaml`.

## -1. Macbook — remaining

- **Test the recovery path on a VM**, not on the daily driver. Boot a clean macOS, run the
  one-liner, and see whether it really comes back. Until that passes, "recoverable" is a claim.
- The brew package list in `hosts/macbook.ts` came from a `brew bundle dump` snapshot, so it includes
  whatever happened to be installed. Worth a read-through to prune the things you don't actually want re-installed on
  a fresh machine.
- Not covered by layer -1, by nature: `aws sso login --profile adamhl8` (browser), and the
  passphrase itself.

## 0. Backups — do this regardless of the IaC work

**App state is not backed up.** Backrest's only plan is `paths: ["/nas/storage"]`, but every
database and config lives on container root disks in the `default` pool: Immich's Postgres,
Umami's Postgres, actual-budget, the \*arr configs, seerr, qbittorrent, scrutiny, homepage.
Media and Papra docs are covered. Nothing else is. If that pool dies, it is all gone.

This is independent of the IaC migration and is the largest current exposure.

Also: `default@pre-tofu-2026-07-12` (recursive ZFS snapshot, all 23 containers) exists as a
restore point. Destroy it once the Tofu import has settled — the pool is 61% full.
Note `zfs rollback` does **not** recurse into child datasets, so a full rollback means
iterating them.

## 1. tsinfra — host bootstrap

Takes over from `metal/`. Owns the host OS and Incus's _existence_; Tofu owns everything
inside the Incus API.

- ZFS, systemd-networkd (`br0` bridging `enp3s0`), Incus from the zabbly repo
- `core.https_address = 10.8.8.2:8000`
- **Mint Tofu's Incus client cert and add it to the trust store.** This is why the host script has
  to run before Tofu: Tofu cannot bootstrap its own access to an Incus that does not exist yet.
- Passwordless sudo (deliberately dropped from the preseed — d-i puts `adam` in the `sudo`
  group, so the first run escalates with the password from sops)
- Declarative hostname

**`incus/incus.md` has rotted and cannot be followed as written.** Its `lan0.network` matches
`enp3s0`, but the live file matches `enp6s0`. Follow the note and the host comes up with no
IPv4 at all: `br0-uplink.network` also matches `enp3s0` and wins on lexical order, `br0` has
an empty `Address=`, and `/etc/network/interfaces` has already been moved aside. Reconcile
against reality, not against the note.

Undocumented assumption to write down: d-i picks `ifupdown` for `target_network_config` only
because `network-manager` and `netplan.io` are never installed. If the host script ever
installs NetworkManager, that breaks silently.

## 2. Tofu — the Incus API

Import the 23 existing containers. Nothing gets deleted.

- **Import IDs must include `,image=`.** Omitting it makes the next `apply` _replace_ the
  instance rather than update it — on containers whose databases are not backed up.
  Verify `tofu plan` shows zero replacements before applying anything.
- Provider `lxc/incus` v1.1.1. Config, devices, and profiles all update in place.
- Resources: the `default` zfs pool, 6 profiles, `net-qbittorrent` (a `physical` network on
  `enp4s0`), 23 instances. `br0` is **not** Incus-managed — it is the host's bridge and
  belongs to the host script.
- Profile **order** matters and is not uniform (`homepage` differs; `qbittorrent` has no
  `net-br0`).
- Keep the existing Unifi DNS module.

**Every tofu recipe in the justfile can silently no-op.** They are gated behind
`aws configure list-profiles | grep -qx adamhl8`, and `run-when` does nothing at all when the
condition fails. On a machine without that profile, `just prepare` skips `tofu init` and
`just tofu-check` skips the plan, and both exit clean. `hosts/macbook.ts` now writes
`~/.aws/config` so the profile exists, but the session still needs `aws sso login`, and an
expired session fails the same silent way. Worth making that gate loud rather than quiet.

Decisions needed: `jellyfin2` is intentional, so import it — but it has no note. Is
`home-assistant.md` (documented, no container) dead?

## 3. tsinfra — inside the containers

Two shapes, ~20 services:

- **Docker Compose** (immich, umami, actual-budget, papra, seerr, qbittorrent, scrutiny,
  homepage, byparr, flaresolverr, discord-app-bot, joieparma-com, adamhl-dev).
- **Native services** (caddy's custom xcaddy build, jellyfin's GPU + pinned Intel debs,
  \*arr, tailscale, backrest, filebrowser, battlegrind).

Incus's native OCI support is **not** a viable replacement for Docker here: no compose, no
`depends_on`, no healthchecks, no restart policies. Immich in particular depends on
`condition: service_healthy`. Keep Docker.

Start with the trivial ones (flaresolverr, byparr). Leave caddy and jellyfin for last.

## 4. Make containers rebuildable (optional, per-service)

`default/custom` is empty — there are no custom storage volumes today, which is why all app
state sits on root disks. Moving each service's data onto an Incus custom volume makes the
container disposable and fixes the backup gap in the same move.

Not a prerequisite for anything above. Do it per-service, when you want the guarantee.

The test that proves the whole stack is real:

```sh
incus delete jellyfin && tofu apply && bask apply jellyfin
```

If Jellyfin comes back with its metadata, the IaC describes reality. Until something like
this passes, the code only _claims_ to.

## 5. Cleanup

- `incus/*.md` become obsolete as each layer lands. Delete them as they do, rather than
  leaving two sources of truth.
- `metal/serve.ts` polish: the template validator is not comment-aware (a `{{VAR}}` in a
  comment errors; a `{{USERNAME}}` in a comment is silently substituted), the `missed` check
  is now dead code, and the "which disk to pick" reminder was dropped — worth restoring,
  since a human choosing correctly at the partitioner is now the only thing protecting the
  nas pool.
- `debconf-utils` was installed on the host while investigating. Harmless, but it is drift.
