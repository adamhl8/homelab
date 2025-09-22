```sh
incus launch images:debian/13/cloud caddy \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

https://caddyserver.com/docs/install#debian-ubuntu-raspbian
https://caddyserver.com/docs/running#using-the-service

```sh
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

https://caddyserver.com/docs/build#package-support-files-for-custom-builds-for-debianubunturaspbian

```sh
curl -fsSLo go.tar.gz 'https://go.dev/dl/go1.24.5.linux-amd64.tar.gz'
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go.tar.gz
rm -rf go.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.bashrc
source ~/.bashrc
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest

# https://github.com/caddy-dns/route53/issues/58#issuecomment-2829589469

go clean -cache
go clean -modcache

xcaddy build \
  --with github.com/greenpau/caddy-security \
  --with github.com/caddy-dns/route53 \
  --replace github.com/libdns/route53=github.com/libdns/route53@master \
  --output ./caddy

chmod +x caddy
```

```sh
sudo dpkg-divert --divert /usr/bin/caddy.default --rename /usr/bin/caddy
sudo mv ./caddy /usr/bin/caddy.custom
sudo update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.default 10
sudo update-alternatives --install /usr/bin/caddy caddy /usr/bin/caddy.custom 50
```

`Caddyfile` in `/etc/caddy/Caddyfile`
`users.json` in `/etc/caddy/users.json`
replace mfa thingy

```sh
sudo mkdir -p /etc/systemd/system/caddy.service.d/
```

`/etc/systemd/system/caddy.service.d/override.conf`:

```txt
[Service]
Environment="AWS_ACCESS_KEY_ID=value"
Environment="AWS_SECRET_ACCESS_KEY=value"
Environment="AWS_REGION=us-east-1"
```

```sh
sudo systemctl daemon-reload
sudo systemctl restart caddy
```

---

set static lease and port forward in opnsense

reboot container

## incus cert

generate cert
download and add to trust store

```sh
openssl pkcs12 -in incus-ui.pfx -clcerts -nokeys -out incus-client.crt
openssl pkcs12 -in incus-ui.pfx -nocerts -nodes -out incus-client.key
```

copy incus-client.crt incus-client.key to caddy

in caddy:

```sh
sudo chmod 644 incus-client.crt incus-client.key
sudo chown caddy:caddy incus-client.crt incus-client.key
sudo mv incus-client.crt incus-client.key /var/lib/caddy/
```

restart caddy
