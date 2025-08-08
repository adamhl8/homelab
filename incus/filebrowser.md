```sh
incus launch images:debian/13/cloud filebrowser \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -c limits.memory=1GiB \
  -d root,size=16GiB
```

```sh
mkdir -p ~/bin
curl -fsSLo ~/filebrowser.tar.gz 'https://github.com/filebrowser/filebrowser/releases/latest/download/linux-amd64-filebrowser.tar.gz'
tar -xzf ~/filebrowser.tar.gz -C ~/bin/ filebrowser
rm ~/filebrowser.tar.gz
chmod +x ~/bin/filebrowser
```

```sh
~/bin/filebrowser config init --database=/home/adam/filebrowser.db --address="0.0.0.0" --port=8000 --auth.method=noauth --root=/nas/storage/
# a user/password is required but doesn't matter since we're using noauth
~/bin/filebrowser --database=/home/adam/filebrowser.db users add adam "$(openssl rand -base64 16)" --perm.admin
```

`/etc/systemd/system/filebrowser.service`:

```
[Unit]
Description=filebrowser
After=network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/bin/filebrowser --database=/home/adam/filebrowser.db
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now filebrowser
```
