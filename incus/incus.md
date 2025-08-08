## ssh access

`/etc/network/interfaces`:

```
auto enp3s0
iface enp3s0 inet static
    address 10.8.8.2
    netmask 255.255.255.0
```

```sh
sudo systemctl restart networking
```

```sh
echo 'alias l="ls -ahl"' >> ~/.bashrc
echo 'adam ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/user-adam-nopasswd > /dev/null
sudo chmod 440 /etc/sudoers.d/user-adam-nopasswd
```

## add contrib

`/etc/apt/sources.list`:

```
deb http://deb.debian.org/debian/ trixie main contrib non-free-firmware
deb http://security.debian.org/debian-security trixie-security main contrib non-free-firmware
deb http://deb.debian.org/debian/ trixie-updates main contrib non-free-firmware
```

```sh
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y
sudo apt install -y curl
```

## ssh

```sh
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook" > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

```sh
sudo find /etc/ssh/ -type f -name 'ssh_host_*' -delete
sudo ssh-keygen -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key -N ""
sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""
awk '$5 >= 4095' /etc/ssh/moduli | sudo tee /etc/ssh/moduli.safe > /dev/null
sudo mv /etc/ssh/moduli /etc/ssh/moduli.bak
sudo mv /etc/ssh/moduli.safe /etc/ssh/moduli
```

`/etc/ssh/sshd_config`: see cloud-init

```sh
sudo systemctl restart ssh
```

## zfs

```sh
sudo apt install linux-headers-amd64 -y
sudo apt install zfsutils-linux -y
sudo systemctl reboot
```

## incus

> https://github.com/zabbly/incus

```sh
sudo mkdir -p /etc/apt/keyrings
sudo curl -fsSLo /etc/apt/keyrings/zabbly.asc https://pkgs.zabbly.com/key.asc
```

`/etc/apt/sources.list.d/zabbly-incus-stable.sources`:

```
Enabled: yes
Types: deb
URIs: https://pkgs.zabbly.com/incus/stable
Suites: trixie
Components: main
Architectures: amd64
Signed-By: /etc/apt/keyrings/zabbly.asc
```

```sh
sudo apt update && sudo apt install -y incus incus-ui-canonical
sudo adduser $USER incus-admin
```

> restart shell

```sh
incus admin init
```

```yaml
config:
  core.https_address: 10.8.8.2:8000
networks: []
storage_pools:
  - config:
      size: 64GiB
    description: ""
    name: default
    driver: zfs
storage_volumes: []
profiles:
  - config: {}
    description: ""
    devices:
      root:
        path: /
        pool: default
        type: disk
    name: default
    project: default
projects: []
certificates: []
cluster: null
```

> get cert from incus web UI

```sh
scp -O ~/Downloads/incus-ui.crt 10.8.8.2:~/
incus config trust add-certificate incus-ui.crt
```

> set up OPNsense

## networking

> - https://discuss.linuxcontainers.org/t/networking-setup-to-best-mimick-proxmoxs-bridge-mode/21941/6
> - https://wiki.debian.org/SystemdNetworkd
> - https://wiki.archlinux.org/title/Systemd-networkd

```sh
sudo mv /etc/network/interfaces /etc/network/interfaces.bak
sudo mkdir -p /etc/systemd/network
sudo systemctl enable systemd-networkd
```

`/etc/systemd/network/lan0.network`:

```
[Match]
Name=enp3s0

[Network]
DHCP=ipv4

[DHCPv4]
UseDomains=yes
```

`/etc/systemd/network/br0.netdev`:

```
[NetDev]
Name=br0
Kind=bridge
MACAddress=a0:36:9f:30:b0:22
```

`/etc/systemd/network/br0.network`:

```
[Match]
Name=br0

[Network]
Address=
```

`/etc/systemd/network/br0-uplink.network`:

```
[Match]
Name=enp1s0f2

[Network]
Bridge=br0
```

```sh
incus profile create net-br0
incus profile device add net-br0 eth0 nic nictype=bridged parent=br0
```

`/etc/systemd/system/incus-webui-wait.service`:

```
[Unit]
Description=Wait for interface to be assigned IP for Incus web UI
After=incus.service
Requires=incus.service

[Service]
User=adam
Type=oneshot
ExecStart=/home/adam/bin/incus-webui-wait.sh

[Install]
WantedBy=multi-user.target
```

`~/bin/incus-webui-wait.sh`:

```sh
#!/bin/sh

echo "Waiting for enp3s0 interface to have IP 10.8.8.2..."

while true; do
  ip_address=$(ip addr show enp3s0 2> /dev/null | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1)

  if [ "$ip_address" = "10.8.8.2" ]; then
    echo "Interface enp3s0 has IP 10.8.8.2"
    break
  fi

  echo "Current IP: ${ip_address:-none}, waiting..."
  sleep 5
done

echo "Setting core.https_address address to 10.8.8.2:8001..."
incus config set core.https_address '10.8.8.2:8001'

echo "Setting core.https_address address to 10.8.8.2:8000..."
incus config set core.https_address '10.8.8.2:8000'

echo "Done"
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now incus-webui-wait.service
```

## scripts

`~/bin/pwr.sh`:

```sh
#!/bin/sh

systemctl_action="${1}"

if [ "${systemctl_action}" != "reboot" ] && [ "${systemctl_action}" != "poweroff" ]; then
  echo "Usage: pwr.sh [reboot|poweroff]"
  exit 1
fi

curl -fsS -X POST -d '{}' \
  -H 'Content-Type: application/json' \
  -u '<opnsense_key>:<opnsense_secret>' \
  http://opnsense.lan/api/core/system/halt > /dev/null
echo "Waiting for OPNsense to halt..."
until incus info opnsense | grep -q 'Status: STOPPED'; do sleep 1; done
echo "OPNsense halted"
sudo systemctl "${systemctl_action}"
```

```sh
chmod +x ~/bin/pwr.sh
```

## nas zpool

```sh
sudo zpool import nas -f
sudo zpool upgrade nas
sudo chown -R adam:adam /nas/storage/

incus profile create nas-storage
incus profile device add nas-storage nas-storage disk shift=true source=/nas/storage path=/nas/storage
```

## incus profiles

```sh
incus profile create cloud-init-base
incus profile edit cloud-init-base
```

```yaml
config:
  cloud-init.vendor-data: |
    #cloud-config
    system_info:
      default_user:
        name: adam
    ssh_authorized_keys:
      - 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook'
    timezone: America/Chicago
    package_update: true
    package_upgrade: true
    packages:
      - openssh-server
      - curl
      - ca-certificates
      - gpg
      - nano
      - jq
    runcmd:
      - sudo find /etc/ssh/ -type f -name 'ssh_host_*' -delete
      - sudo ssh-keygen -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key -N ""
      - sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""
      - awk '$5 >= 4095' /etc/ssh/moduli | sudo tee /etc/ssh/moduli.safe >/dev/null
      - sudo mv /etc/ssh/moduli /etc/ssh/moduli.bak
      - sudo mv /etc/ssh/moduli.safe /etc/ssh/moduli
      - sudo systemctl restart ssh
    write_files:
      - path: /etc/ssh/sshd_config
        owner: root:root
        permissions: '0644'
        content: |
          Include /etc/ssh/sshd_config.d/*.conf

          UsePAM yes # needed because user account is locked
          challengeresponseauthentication no
          clientaliveinterval 600
          kbdinteractiveauthentication no
          maxauthtries 3
          passwordauthentication no
          permitemptypasswords no
          permitrootlogin no
          printmotd no
          HostKey /etc/ssh/ssh_host_rsa_key
          HostKey /etc/ssh/ssh_host_ed25519_key
          KexAlgorithms sntrup761x25519-sha512@openssh.com,curve25519-sha256,curve25519-sha256@libssh.org,gss-curve25519-sha256-,diffie-hellman-group16-sha512,gss-group16-sha512-,diffie-hellman-group18-sha512,diffie-hellman-group-exchange-sha256
          Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
          MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,umac-128-etm@openssh.com
          HostKeyAlgorithms ssh-ed25519,ssh-ed25519-cert-v01@openssh.com,sk-ssh-ed25519@openssh.com,sk-ssh-ed25519-cert-v01@openssh.com,rsa-sha2-512,rsa-sha2-512-cert-v01@openssh.com,rsa-sha2-256,rsa-sha2-256-cert-v01@openssh.com
description: ""
devices: {}
name: cloud-init-base
used_by: []
project: default
```

```sh
incus profile create docker
incus profile edit docker
```

```yaml
config:
  security.nesting: true
  cloud-init.user-data: |
    #cloud-config
    runcmd:
      - sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
      - sudo echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian trixie stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
      - sudo apt update
      - sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
      - sudo usermod -aG docker adam
description: ""
devices: {}
name: cloud-init-docker
used_by: []
project: default
```
