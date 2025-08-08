> https://jmn.au/posts/incus-opnsense/

```sh
incus init opnsense --empty --vm -c limits.cpu=2 -c limits.memory=4GiB \
  -c security.secureboot=false \
  -c boot.autostart=true \
  -c raw.qemu='-cpu host' \
  -c raw.qemu.conf='[device "dev-qemu_rng"]' \
  -d root,size=16GiB
```

> use `lspci` to find the PCI device IDs for the network interfaces

```sh
incus config device add opnsense enp1s0f0 pci address=01:00.0
incus config device add opnsense enp1s0f1 pci address=01:00.1
```

```sh
scp -O ~/Downloads/OPNsense-25.1-dvd-amd64.iso 10.8.8.2:~/

incus storage volume import default ./OPNsense-25.1-dvd-amd64.iso opnsense-installer --type=iso
incus config device add opnsense iso-volume disk pool=default source=opnsense-installer boot.priority=10
```

> start and install OPNsense via incus web UI
> For ssh, add authorized_keys by editing root user in OPNsense web UI
