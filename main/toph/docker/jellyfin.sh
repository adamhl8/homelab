#!/bin/bash

mkdir ~/apps/jellyfin/

tee ~/apps/jellyfin/docker-compose.yml << EOF
version: "3"

services:
  jellyfin:
    image: lscr.io/linuxserver/jellyfin
    container_name: jellyfin
    restart: always
    ports:
      - 8015:8096
    devices:
      - /dev/dri/
    volumes:
      - ./data/:/config/
      - /mnt/storage/Other/Z/Z/:/Z/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/jellyfin/
docker compose up -d
cd ~/