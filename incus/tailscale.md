```sh
incus launch images:debian/13/cloud tailscale \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -c limits.memory=1GiB \
  -d root,size=16GiB
```

https://tailscale.com/kb/1019/subnets#connect-to-tailscale-as-a-subnet-router

```sh
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
```

https://tailscale.com/kb/1320/performance-best-practices#linux-optimizations-for-subnet-routers-and-exit-nodes

```sh
sudo apt install ethtool
```

> The image we're using doesn't haven networkd-dispatcher and only uses systemd-networkd
> https://www.reddit.com/r/Tailscale/comments/18qzf9f/comment/kf0sha4/

`/etc/systemd/system/udpgroforwarding.service`:

```
[Unit]
Description=UDPGroForwarding
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/ethtool -K eth0 rx-udp-gro-forwarding on rx-gro-list off

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now udpgroforwarding
```

Reboot and confirm:

`sudo ethtool -k eth0 | egrep "(gro-list|forwarding)"`

```sh
curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg > /dev/null
curl -fsSL https://pkgs.tailscale.com/stable/debian/trixie.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt update && sudo apt install -y tailscale
sudo tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
```

```sh
tailscale drive share storage /nas/storage/
tailscale drive share joie /nas/storage/Joie/
```
