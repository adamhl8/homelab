#!/bin/bash

mkdir ~/apps/wg-access-server/

# Generate wireguard private key
sudo apt install wireguard -y
wg_key=$(wg genkey)

# Enable kernel modules
sudo modprobe ip_tables && sudo modprobe wireguard
echo ip_tables | sudo tee -a /etc/modules
echo wireguard | sudo tee -a /etc/modules

read -p "wg-access-server password: " wg_password
tee ~/apps/wg-access-server/docker-compose.yml << EOF
version: "3"

services:
  wg-access-server:
    image: ghcr.io/freifunkmuc/wg-access-server
    container_name: wg-access-server
    restart: always
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun:/dev/net/tun
    ports:
      - 8007:8000/tcp
      - 51820:51820/udp
    volumes:
      - ./data/:/data/
    environment:
      - WG_EXTERNAL_HOST=wg.adamhl.dev
      - WG_ADMIN_USERNAME=adam
      - WG_ADMIN_PASSWORD=${wg_password}
      - WG_WIREGUARD_PRIVATE_KEY=${wg_key}
      - WG_DNS_UPSTREAM=1.1.1.1
      - WG_VPN_CIDRV6=0
EOF

cd ~/apps/wg-access-server/
docker compose up -d
cd ~/