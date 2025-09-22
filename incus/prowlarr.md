```sh
incus launch images:debian/13/cloud prowlarr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```sh
sudo apt install -y sqlite3
```

```sh
curl -fsSLo packages-microsoft-prod.deb https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb
sudo apt install ./packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update && sudo apt install -y dotnet-runtime-8.0
```

```sh
curl -fsSLo prowlarr.tar.gz 'https://prowlarr.servarr.com/v1/update/master/updatefile?os=linux&runtime=netcore&arch=x64'
tar -xzf prowlarr.tar.gz
rm -rf prowlarr.tar.gz
```

```sh
mkdir -p ~/.prowlarr/
```

`/etc/systemd/system/prowlarr.service`:

```
[Unit]
Description=Prowlarr
After=syslog.target network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/Prowlarr/Prowlarr -nobrowser -data=/home/adam/.prowlarr/
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now prowlarr.service
```

```sh
sed -i -r 's|<Port>.+</Port>|<Port>8000</Port>|' ~/.prowlarr/config.xml
sudo systemctl restart prowlarr.service
```
