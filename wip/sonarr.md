ssh -q -t root@pve.lan 'bash -l -c "pct create 108 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
 --hostname sonarr \
 --password password \
 --unprivileged 1 \
 --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
 --rootfs local-zfs:8 \
 --cores 2 \
 --memory 2048 \
 --storage local-lvm \
 --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp,ip6=manual \
 --mp0 /nas/storage,mp=/nas/storage \
 --onboot 1"'

/etc/pve/lxc/108.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

ssh -q -t root@pve.lan 'bash -l -c "pct start 108"'

ssh -q -t root@10.8.8.108 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@10.8.8.108 'bash -l -c "apt install curl sqlite3 -y"'
ssh -q -t root@10.8.8.108 'bash -l -c "dpkg-reconfigure tzdata"'
ssh -q -t root@10.8.8.108 'bash -l -c "mkdir -p /var/lib/sonarr/ && chmod 775 /var/lib/sonarr/"'
ssh -q -t root@10.8.8.108 'bash -l -c "curl -Lo SonarrV4.tar.gz \'https://services.sonarr.tv/v1/download/main/latest?version=4&os=linux&arch=x64\'"'
ssh -q -t root@10.8.8.108 'bash -l -c "tar -xzf SonarrV4.tar.gz"'
ssh -q -t root@10.8.8.108 'bash -l -c "mv Sonarr /opt"'
ssh -q -t root@10.8.8.108 'bash -l -c "rm -rf SonarrV4.tar.gz"'

/etc/systemd/system/sonarr.service

```
[Unit]
Description=Sonarr Daemon
After=syslog.target network.target
[Service]
Type=simple
ExecStart=/opt/Sonarr/Sonarr -nobrowser -data=/var/lib/sonarr/
TimeoutStopSec=20
KillMode=process
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

systemctl enable -q --now sonarr.service
