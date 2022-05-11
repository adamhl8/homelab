#!/bin/bash

mkdir ~/apps/webtop/

cp -r ~/backup/webtop/data/ ~/apps/webtop/

tee ~/apps/webtop/docker-compose.yml << EOF
version: "3"

services:
  webtop:
    image: lscr.io/linuxserver/webtop:ubuntu-xfce
    container_name: webtop
    restart: always
    shm_size: "1gb"
    security_opt:
      - seccomp:unconfined
    devices:
      - /dev/dri/:/dev/dri/
    ports:
      - 8008:3000
    volumes:
      - ./data/:/config/
      - /mnt/storage/Stuff/:/config/Stuff/
    environment:
      - PUID=1000
      - PGID=1000
EOF

cd ~/apps/webtop/
docker compose up -d
cd ~/