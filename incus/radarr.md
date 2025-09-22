```sh
incus launch images:debian/13/cloud radarr \
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
curl -fsSLo radarr.tar.gz 'https://radarr.servarr.com/v1/update/master/updatefile?os=linux&runtime=netcore&arch=x64'
tar -xzf radarr.tar.gz
rm -rf radarr.tar.gz
```

```sh
mkdir -p ~/.radarr/
```

`/etc/systemd/system/radarr.service`:

```
[Unit]
Description=Radarr
After=syslog.target network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/Radarr/Radarr -nobrowser -data=/home/adam/.radarr/
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now radarr.service
```

```sh
sed -i -r 's|<Port>.+</Port>|<Port>8000</Port>|' ~/.radarr/config.xml
sudo systemctl restart radarr.service
```
