#!/bin/bash

mkdir ~/apps/reaction-light/

cp -r ~/backup/reaction-light/data/ ~/apps/reaction-light/
cp -r ~/backup/reaction-light/config.ini ~/apps/reaction-light/

tee ~/apps/reaction-light/docker-compose.yml << EOF
version: "3"

services:
  reaction-light:
    image: ghcr.io/eibex/reaction-light
    container_name: reaction-light
    restart: always
    volumes:
      - ./data/:/bot/files/
      - ./config.ini:/bot/config.ini
EOF

cd ~/apps/reaction-light/
docker compose up -d
cd ~/