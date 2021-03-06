#!/bin/bash

mkdir ~/apps/webtop/

tee ~/apps/webtop/docker-compose.yml << EOF
version: "3"
services:
  webtop:
    image: lscr.io/linuxserver/webtop:ubuntu-kde
    container_name: webtop
    restart: always
    security_opt:
      - seccomp:unconfined
    devices:
      - /dev/dri/:/dev/dri/
    ports:
      - 8017:3000
    volumes:
      - ./data/:/config/
      - /mnt/storage/:/config/Storage/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/webtop/
docker compose up -d
cd ~/ 