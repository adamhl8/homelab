```sh
incus init home-assistant --empty --vm -c limits.cpu=2 -c limits.memory=4GiB \
  -c security.secureboot=false \
  -c raw.qemu='-cpu host' \
  -c raw.qemu.conf='[device "dev-qemu_rng"]' \
  -d root,size=16GiB
```

```sh
curl -fsSLo haos.qcow2.xz https://github.com/home-assistant/operating-system/releases/download/16.0/haos_generic-aarch64-16.0.qcow2.xz
unxz haos.qcow2.xz
sudo apt install -y incus-extra qemu-utils
sudo incus-migrate
```

```
2) Virtual Machine
path: haos.qcow2
Override profile list: default net-br0
Set disk size
```

```sh
incus config set haos limits.cpu 2
incus config set haos limits.memory 4GiB

incus start haos
```
