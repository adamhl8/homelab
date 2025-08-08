```sh
incus init images:debian/13/cloud qbittorrent \
  -p default \
  -p cloud-init-base \
  -p nas-storage \
  -p docker \
  -c limits.cpu=2 \
  -c limits.memory=3GiB \
  -d root,size=16GiB

incus network create net-qbittorrent --type=physical parent=enp1s0f3
incus network attach net-qbittorrent qbittorrent eth0
incus start qbittorrent
```

```sh
mkdir -p ~/qbittorrent/qBittorrent/
```

`~/qbittorrent/qBittorrent/qBittorrent.conf`:

```
[BitTorrent]
Session\AddTorrentStopped=false
Session\AnonymousModeEnabled=false
Session\BTProtocol=TCP
Session\DHTEnabled=true
Session\DefaultSavePath=/nas/storage/Media/Downloads
Session\DisableAutoTMMByDefault=false
Session\DisableAutoTMMTriggers\CategoryChanged=false
Session\DisableAutoTMMTriggers\CategorySavePathChanged=false
Session\DisableAutoTMMTriggers\DefaultSavePathChanged=false
Session\GlobalDLSpeedLimit=600000
Session\GlobalUPSpeedLimit=600000
Session\Interface=tun0
Session\InterfaceName=tun0
Session\LSDEnabled=true
Session\MaxConnections=9999
Session\MaxConnectionsPerTorrent=999
Session\MaxUploads=9999
Session\MaxUploadsPerTorrent=999
Session\PeXEnabled=true
Session\Preallocation=true
Session\QueueingSystemEnabled=false
Session\TorrentContentLayout=Original

[Core]
AutoDeleteAddedTorrentFile=IfAdded

[LegalNotice]
Accepted=true

[Network]
PortForwardingEnabled=false

[Preferences]
Advanced\RecheckOnCompletion=true
General\StatusbarExternalIPDisplayed=true
WebUI\AuthSubnetWhitelist=0.0.0.0/0
WebUI\AuthSubnetWhitelistEnabled=true
WebUI\LocalHostAuth=false
WebUI\Password_PBKDF2="@ByteArray(TnnfPtYr54YqX0SmLlvYPg==:T0shuinwNDF9i/otNhu3Tu96X1YPjuYeLXWpRdZUzFJL4J6GlU+iK9pCGChGcc807ibuwj/Ds6h80lGojzXHjg==)"
WebUI\UseUPnP=false
WebUI\Username=adam
```

`.env`:

```env
TZ=America/Chicago

QBITTORRENT_WEBUI_PORT=8000
WIREGUARD_PRIVATE_KEY=<value>
```

`compose.yaml`:

```yaml
name: qbittorrent

services:
  gluetun:
    container_name: gluetun
    image: qmcgaw/gluetun
    restart: always
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun:/dev/net/tun
    ports:
      - ${QBITTORRENT_WEBUI_PORT}:${QBITTORRENT_WEBUI_PORT}
    volumes:
      - gluetun:/gluetun/
    environment:
      - TZ=${TZ}
      - VPN_SERVICE_PROVIDER=protonvpn
      - VPN_TYPE=wireguard
      - WIREGUARD_PRIVATE_KEY=${WIREGUARD_PRIVATE_KEY}
      - SERVER_COUNTRIES=United States
      - PORT_FORWARD_ONLY=on
      - VPN_PORT_FORWARDING=on
      - VPN_PORT_FORWARDING_UP_COMMAND=/bin/sh -c '/usr/bin/wget -O- --retry-connrefused --post-data "json={\"listen_port\":{{PORTS}}}" http://127.0.0.1:${QBITTORRENT_WEBUI_PORT}/api/v2/app/setPreferences 2>&1'
      - HTTP_CONTROL_SERVER_ADDRESS=":8001" # change from default of 8000 since that's what we use for qbittorrent

  qbittorrent:
    container_name: qbittorrent
    image: lscr.io/linuxserver/qbittorrent
    network_mode: "service:gluetun"
    restart: always
    volumes:
      - ./qbittorrent/:/config/
      - /nas/storage/Media/:/nas/storage/Media/
    environment:
      - TZ=${TZ}
      - PUID=1000
      - PGID=1000
      - WEBUI_PORT=${QBITTORRENT_WEBUI_PORT}
    depends_on:
      gluetun:
        condition: service_healthy

volumes:
  gluetun:
```

```sh
docker compose up -d
```
