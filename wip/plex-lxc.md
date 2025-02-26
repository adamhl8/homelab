ssh -q -t root@pve.lan 'bash -l -c "pct create 106 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
 --hostname plex \
 --password password \
 --unprivileged 1 \
 --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
 --rootfs local-zfs:16 \
 --cores 2 \
 --memory 1024 \
 --storage local-lvm \
 --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp,ip6=dhcp \
 --onboot 1"'

/etc/pve/lxc/106.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

ssh -q -t root@pve.lan 'bash -l -c "echo 'mp0: /nas/storage,mp=/nas/storage' >>/etc/pve/lxc/106.conf"'
ssh -q -t root@pve.lan 'bash -l -c "echo 'dev0: /dev/dri/card1,gid=44' >>/etc/pve/lxc/106.conf"'
ssh -q -t root@pve.lan 'bash -l -c "echo 'dev1: /dev/dri/renderD128,gid=104' >>/etc/pve/lxc/106.conf"'
ssh -q -t root@pve.lan 'bash -l -c "cat /etc/pve/lxc/106.conf"'
ssh -q -t root@pve.lan 'bash -l -c "pct start 106"'

ssh -q -t root@10.8.8.106 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@10.8.8.106 'bash -l -c "apt install curl gpg -y"'
ssh -q -t root@10.8.8.106 'bash -l -c "dpkg-reconfigure tzdata"'
ssh -q -t root@10.8.8.106 'bash -l -c "apt install -y va-driver-all ocl-icd-libopencl1 intel-opencl-icd vainfo intel-gpu-tools"'
ssh -q -t root@10.8.8.106 'bash -l -c "curl -Lo /usr/share/keyrings/PlexSign.asc https://downloads.plex.tv/plex-keys/PlexSign.key"'
ssh -q -t root@10.8.8.106 'bash -l -c "echo 'deb [signed-by=/usr/share/keyrings/PlexSign.asc] https://downloads.plex.tv/repo/deb/ public main' >/etc/apt/sources.list.d/plexmediaserver.list"'
ssh -q -t root@10.8.8.106 'bash -l -c "apt update && apt install plexmediaserver -y"'
