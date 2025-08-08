```sh
incus launch images:debian/13/cloud sonarr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -c limits.memory=1GiB \
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
curl -fsSLo sonarr.tar.gz 'https://services.sonarr.tv/v1/download/main/latest?version=4&os=linux&arch=x64'
tar -xzf sonarr.tar.gz
rm -rf sonarr.tar.gz
```

```sh
mkdir -p ~/.sonarr/
```

`/etc/systemd/system/sonarr.service`:

```
[Unit]
Description=Sonarr
After=syslog.target network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/Sonarr/Sonarr -nobrowser -data=/home/adam/.sonarr/
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now sonarr.service
```

```sh
sed -i -r 's|<Port>.+</Port>|<Port>8000</Port>|' ~/.sonarr/config.xml
sudo systemctl restart sonarr.service
```
