on pve host:

```sh
pct create 102 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
  --hostname caddy \
  --password Ov3rclocking! \
  --unprivileged 1 \
  --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
  --rootfs local-zfs:16 \
  --cores 2 \
  --memory 1024 \
  --storage local-lvm \
  --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp,ip6=dhcp \
  --onboot 1

# --startup order=N \
```

---

get uuid of subnet:

```sh
curl -k \
  -u "$(sops -d --extract "['opnsense_key']" ~/secrets.yaml):$(sops -d --extract "['opnsense_secret']" ~/secrets.yaml)" \
  -X GET \
  'https://opnsense.adamhl.dev/api/kea/dhcpv4/searchSubnet'
```

```sh
curl -k \
  -u "$(sops -d --extract "['opnsense_key']" ~/secrets.yaml):$(sops -d --extract "['opnsense_secret']" ~/secrets.yaml)" \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"reservation": { "subnet": "<subnet-uuid>", "ip_address": "10.8.8.4", "hw_address": "bc:24:11:f9:d4:82", "hostname": "caddy" }}' \
  'https://opnsense.adamhl.dev/api/kea/dhcpv4/addReservation'
```

restart kea and unbound:

```sh
curl -k \
  -u "$(sops -d --extract "['opnsense_key']" ~/secrets.yaml):$(sops -d --extract "['opnsense_secret']" ~/secrets.yaml)" \
  -X POST \
  -d '' \
  'https://opnsense.adamhl.dev/api/kea/service/restart'

curl -k \
  -u "$(sops -d --extract "['opnsense_key']" ~/secrets.yaml):$(sops -d --extract "['opnsense_secret']" ~/secrets.yaml)" \
  -X POST \
  -d '' \
  'https://opnsense.adamhl.dev/api/unbound/service/restart'
```

pve:

```sh
pct start 102
```

in caddy container:

```sh
apt update && apt full-upgrade -y && apt autoremove -y
apt install curl -y
```

https://caddyserver.com/docs/install#debian-ubuntu-raspbian
https://caddyserver.com/docs/running#using-the-service

```sh
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

https://caddyserver.com/docs/build#package-support-files-for-custom-builds-for-debianubunturaspbian

```sh
curl -fsSLo caddy 'https://caddyserver.com/api/download?os=linux&arch=amd64&p=github.com%2Fcaddy-dns%2Froute53&p=github.com%2Fgreenpau%2Fcaddy-security%40latest&idempotency=57032529439103'
chmod +x caddy
```

```sh
dpkg-divert --divert /usr/bin/caddy.default --rename /usr/bin/caddy
mv ./caddy /usr/bin/caddy.custom
update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.default 10
update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.custom 50
```

`Caddyfile` in `/etc/caddy/Caddyfile`
`users.json` in `/etc/caddy/users.json`
replace mfa thingy

/etc/systemd/system/caddy.service.d/override.conf

```txt
[Service]
Environment="AWS_ACCESS_KEY_ID=value"
Environment="AWS_SECRET_ACCESS_KEY=value"
Environment="AWS_REGION=us-east-1"
```

```sh
systemctl daemon-reload
systemctl restart caddy
```

---

updating:

```sh
caddy upgrade
systemctl restart caddy
```
