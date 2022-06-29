#!/bin/bash

mkdir ~/apps/kavita/

tee ~/apps/kavita/docker-compose.yml << EOF
version: "3"

services:
  kavita:
    image: kizaing/kavita
    container_name: kavita
    restart: always
    ports:
      - 8013:5000
    volumes:
      - /mnt/storage/Library/:/Library/
      - ./data/:/kavita/config/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/kavita/
docker compose up -d
cd ~/