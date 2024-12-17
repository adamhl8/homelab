ssh -q -t root@pve.lan 'bash -l -c "pct create 107 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
 --hostname qbittorrent \
 --password password \
 --unprivileged 1 \
 --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
 --rootfs local-zfs:16 \
 --cores 2 \
 --memory 2048 \
 --storage local-lvm \
 --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp,ip6=manual \
 --mp0 /nas/storage,mp=/nas/storage \
 --onboot 1"'

/etc/pve/lxc/107.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

ssh -q -t root@pve.lan 'bash -l -c "pct start 107"'

ssh -q -t root@10.8.8.18 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@10.8.8.18 'bash -l -c "apt install curl gpg -y"'
ssh -q -t root@10.8.8.18 'bash -l -c "dpkg-reconfigure tzdata"'
ssh -q -t root@10.8.8.18 'bash -l -c "mkdir -p ~/bin"'
ssh -q -t root@10.8.8.18 'bash -l -c "mkdir -p /.config/qBittorrent/"'
ssh -q -t root@10.8.8.18 'bash -l -c "curl -Lo ~/bin/qbittorrent-nox https://github.com/userdocs/qbittorrent-nox-static/releases/latest/download/x86_64-qbittorrent-nox"'
ssh -q -t root@10.8.8.18 'bash -l -c "chmod +x ~/bin/qbittorrent-nox"'

/.config/qBittorrent/qBittorrent.conf

```
[BitTorrent]
Session\DefaultSavePath=/nas/storage/Media/Downloads

[Preferences]
General\Locale=en
WebUI\Username=adam
WebUI\Password_PBKDF2="@ByteArray(TnnfPtYr54YqX0SmLlvYPg==:T0shuinwNDF9i/otNhu3Tu96X1YPjuYeLXWpRdZUzFJL4J6GlU+iK9pCGChGcc807ibuwj/Ds6h80lGojzXHjg==)"
WebUI\AuthSubnetWhitelist=0.0.0.0/0
WebUI\AuthSubnetWhitelistEnabled=true
WebUI\LocalHostAuth=false
WebUI\UseUPnP=false
```

/etc/systemd/system/qbittorrent-nox.service

```
[Unit]
Description=qBittorrent-nox
After=network.target
[Service]
ExecStart=/root/bin/qbittorrent-nox
Restart=always
[Install]
WantedBy=multi-user.target
```

systemctl enable -q --now qbittorrent-nox
