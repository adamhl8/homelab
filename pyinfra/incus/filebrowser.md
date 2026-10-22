```sh
incus launch images:debian/13/cloud filebrowser \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```sh
sudo apt install -y ffmpeg
mkdir -p ~/bin ~/.filebrowser
curl -fsSLo ~/bin/filebrowser 'https://github.com/gtsteffaniak/filebrowser/releases/download/v2.0.7-beta/linux-amd64-filebrowser'
chmod +x ~/bin/filebrowser
```

`/home/adam/.filebrowser/config.yaml`:

```yaml
server:
  cacheDir: /home/adam/.filebrowser/cache/
  database:
    path: /home/adam/.filebrowser/filebrowser.sqlite
  sources:
    - path: /nas/storage
      config:
        defaultEnabled: true
auth:
  adminUsername: adam
  methods:
    noauth: true
http:
  port: 8000
  externalUrl: https://filebrowser.adamhl.dev
  trustProxyHeaders: true
integrations:
  media:
    ffmpegPath: /usr/bin
```

`/etc/systemd/system/filebrowser.service`:

```
[Unit]
Description=filebrowser
After=network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/bin/filebrowser -c /home/adam/.filebrowser/config.yaml
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now filebrowser
```
