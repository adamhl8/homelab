```sh
incus launch images:debian/13/cloud rarebound \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

From the rarebound repo (builds the static site, then replaces `~/dist` in place with it):

```bash
bask deploy
```

```bash
mkdir -p ~/bin
curl -fsSLo ~/bin/miniserve https://github.com/svenstaro/miniserve/releases/download/v0.33.0/miniserve-0.33.0-x86_64-unknown-linux-gnu
chmod +x ~/bin/miniserve
```

`/etc/systemd/system/rarebound.service`:

```
[Unit]
Description=rarebound
After=network.target

[Service]
User=adam
Type=exec
WorkingDirectory=/home/adam/dist
ExecStart=/home/adam/bin/miniserve -p 8000 --index index.html
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now rarebound
```
