#!/bin/bash

mkdir ~/apps/sonarr/

tee ~/apps/sonarr/docker-compose.yml << EOF
version: "3"

services:
  sonarr:
    image: lscr.io/linuxserver/sonarr
    container_name: sonarr
    restart: always
    ports:
      - 8010:8989
    volumes:
      - ./data/:/config/
      - /mnt/storage/Media/:/Media/
    environment:
      - PUID=1000
      - PGID=1000
EOF

cd ~/apps/sonarr/
docker compose up -d
cd ~/