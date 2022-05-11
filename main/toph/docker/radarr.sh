#!/bin/bash

mkdir ~/apps/radarr/

tee ~/apps/radarr/docker-compose.yml << EOF
version: "3"

services:
  radarr:
    image: lscr.io/linuxserver/radarr
    container_name: radarr
    restart: always
    ports:
      - 8011:7878
    volumes:
      - ./data/:/config/
      - /mnt/storage/Media/:/Media/
    environment:
      - PUID=1000
      - PGID=1000
EOF

cd ~/apps/radarr/
docker compose up -d
cd ~/