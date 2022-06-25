#!/bin/bash

mkdir ~/apps/qbittorrent/

source ~/secrets
tee ~/apps/qbittorrent/wg0.conf << EOF
[Interface]
# Key for qbittorrent
# NetShield = 0
# Moderate NAT = off
# VPN Accelerator = on
PrivateKey = ${qbittorrent_wireguard_key}
Address = 10.2.0.2/32
DNS = 10.2.0.1

[Peer]
# US-NY#38
PublicKey = 4Gjn941JfIDqDB3KWubQ4slUR362dUrgbT7WGvldPlM=
AllowedIPs = 0.0.0.0/0
Endpoint = 193.148.18.66:51820
EOF

tee ~/apps/qbittorrent/docker-compose.yml << EOF
version: "3"

services:
  qbittorrent:
    image: cr.hotio.dev/hotio/qbittorrent
    container_name: qbittorrent
    restart: always
    cap_add:
      - NET_ADMIN
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    ports:
      - 8008:8080
    volumes:
      - ./data/:/config/
      - ./wg0.conf:/config/wireguard/wg0.conf
      - /mnt/storage/Media/:/Media/
    environment:
      - VPN_ENABLED=true
      - VPN_LAN_NETWORK=10.8.8.0/24
      - VPN_CONF=wg0
      - VPN_IP_CHECK_DELAY=5
      - PRIVOXY_ENABLED=false
      - FLOOD_AUTH=false
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/qbittorrent/
docker compose up -d
cd ~/