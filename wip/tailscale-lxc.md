ssh root@<tailscale-ip>

apt update && apt full-upgrade -y && apt autoremove -y
apt install curl -y

[Tailscale LXC Unprivileged](https://tailscale.com/kb/1130/lxc-unprivileged)

on proxmox host:

append to /etc/pve/lxc/<tailscale-lxc-id>.conf

```
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

https://tailscale.com/kb/1019/subnets#connect-to-tailscale-as-a-subnet-router

```sh
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

https://tailscale.com/kb/1320/performance-best-practices#linux-optimizations-for-subnet-routers-and-exit-nodes

```sh
printf '#!/bin/sh\n\nethtool -K %s rx-udp-gro-forwarding on rx-gro-list off \n' "$(ip -o route get 8.8.8.8 | cut -f 5 -d " ")" | sudo tee /etc/networkd-dispatcher/routable.d/50-tailscale
sudo chmod 755 /etc/networkd-dispatcher/routable.d/50-tailscale
```

sudo reboot

curl -fsSL https://tailscale.com/install.sh | sh

tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16


append to /etc/pve/lxc/<tailscale-lxc-id>.conf
```
mp0: /nas/storage,mp=/nas/storage
```

tailscale drive share storage /nas/storage/

https://pve.proxmox.com/wiki/Unprivileged_LXC_containers

/etc/pve/lxc/<tailscale-lxc-id>.conf
```
# uid map: from uid 0 map 1000 uids (in the ct) to the range starting 100000 (on the host), so 0..1004 (ct) → 100000..101004 (host)
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
# we map 1 uid starting from uid 1000 onto 1000, so 1000 → 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
# we map the rest of 65535 from 1001 upto 101001, so 1001..65535 → 101001..165535
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

/etc/subuid
/etc/subgid
```
root:1000:1
```

chown -R 1000:1000 /nas/storage
