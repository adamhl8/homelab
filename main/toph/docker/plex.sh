#!/bin/bash

mkdir ~/apps/plex/

tee ~/apps/plex/docker-compose.yml << EOF
version: "3"

services:
  plex:
    image: lscr.io/linuxserver/plex
    container_name: plex
    restart: always
    devices:
      - /dev/dri/
    ports:
      - 8016:32400
      - 32410-32414:32410-32414/udp
    volumes:
      - ./data/:/config/
      - /mnt/storage/Media/:/Media/
    environment:
      - VERSION=latest
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/plex/
docker compose up -d
cd ~/