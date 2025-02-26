ssh -q -t root@pve.lan 'bash -l -c "pct create 110 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
 --hostname unifi \
 --password password \
 --unprivileged 1 \
 --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
 --rootfs local-zfs:16 \
 --cores 2 \
 --memory 2048 \
 --storage local-lvm \
 --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp \
 --onboot 1"'

ssh -q -t root@pve.lan 'bash -l -c "pct start 110"'

ssh -q -t root@10.8.8.110 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@10.8.8.110 'bash -l -c "apt install curl gpg -y"'
ssh -q -t root@10.8.8.110 'bash -l -c "dpkg-reconfigure tzdata"'

curl -fsSL https://apt.corretto.aws/corretto.key | gpg --dearmor -o /usr/share/keyrings/corretto-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/corretto-keyring.gpg] https://apt.corretto.aws stable main" | tee /etc/apt/sources.list.d/corretto.list
apt update && apt install -y java-21-amazon-corretto-jdk

curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | tee /etc/apt/sources.list.d/mongodb-org-8.0.list
apt update && apt install -y mongodb-org

curl -Lo ~/unifi.deb https://dl.ui.com/unifi/9.0.108-u598f2io2a/unifi_sysvinit_all.deb
apt install -y ~/unifi.deb && rm ~/unifi.deb
