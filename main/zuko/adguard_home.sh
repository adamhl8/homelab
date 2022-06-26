#!/bin/bash

mkdir ~/apps/adguardhome/

tee ~/apps/adguardhome/docker-compose.yml << EOF
version: "3"

services:
  adguardhome:
    image: adguard/adguardhome
    container_name: adguardhome
    restart: always
    network_mode: host
    volumes:
      - ./data/work/:/opt/adguardhome/work/
      - ./data/config/:/opt/adguardhome/conf/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/adguardhome/
docker compose up -d
cd ~/

cat << EOF
  - Query logs retention: 24 hours
  - Upstream DNS: 
    - tls://1dot1dot1dot1.cloudflare-dns.com
    - [/lan/]10.8.8.1
  - Parallel requests
  - Bootstrap DNS:
    - 1.1.1.1
    - 1.0.0.1
  - Cache size: 10000000
  - Optimistic caching
EOF