#!/bin/bash

mkdir ~/apps/plex/

tee ~/apps/plex/docker-compose.yml << EOF
version: "3"

services:
  plex:
    image: lscr.io/linuxserver/plex
    container_name: plex
    restart: always
    network_mode: host
    devices:
      - /dev/dri/:/dev/dri/
    volumes:
      - ./data/:/config/
      - /mnt/storage/Media/:/Media/
    environment:
      - PUID=1000
      - PGID=1000
      - VERSION=latest
EOF

cd ~/apps/plex/
docker compose up -d
cd ~/