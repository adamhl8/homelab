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