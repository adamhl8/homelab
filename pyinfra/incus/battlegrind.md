```sh
incus launch images:debian/13/cloud battlegrind \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```bash
scp -r -O ./dist/ battlegrind.lan:~/
```

```bash
mkdir -p ~/bin
curl -fsSLo ~/bin/miniserve https://github.com/svenstaro/miniserve/releases/download/v0.33.0/miniserve-0.33.0-x86_64-unknown-linux-gnu
chmod +x ~/bin/miniserve
```

`/etc/systemd/system/battlegrind.service`:

```
[Unit]
Description=battlegrind
After=network.target

[Service]
User=adam
Type=exec
WorkingDirectory=/home/adam/dist
ExecStart=/home/adam/bin/miniserve -p 8000 --spa --pretty-urls --index index.html
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now battlegrind
```
