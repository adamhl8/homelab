#!/bin/bash

mkdir ~/apps/xbackbone/

cp -r ~/backup/xbackbone/data/ ~/apps/xbackbone/

tee ~/apps/xbackbone/docker-compose.yml << EOF
version: "3"

services:
  xbackbone:
    image: lscr.io/linuxserver/xbackbone
    container_name: xbackbone
    restart: always
    ports:
      - 8006:80
    volumes:
      - ./data/:/config/
    environment:
      - PUID=1000
      - PGID-1000
EOF

cd ~/apps/xbackbone/
docker compose up -d
cd ~/