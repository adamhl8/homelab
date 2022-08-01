#!/bin/bash

mkdir ~/apps/eyir/
touch ~/apps/eyir/filebrowser.db

source ~/secrets
tee ~/apps/eyir/docker-compose.yml << EOF
version: "3"

services:
  eyir:
    image: ghcr.io/adamhl8/eyir
    container_name: eyir
    restart: always
    volumes:
      - /home/adam/apps/eyir/eyir/faq/:/app/faq/
    environment:
      - BOT_TOKEN=${eyir_token}
      - CLIENT_ID=320863841548238848
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago

  filebrowser:
    image: filebrowser/filebrowser
    container_name: eyir-filebrowser
    restart: always
    ports:
      - 8003:80
    volumes:
      - ./filebrowser.db:/database.db
      - /home/adam/apps/eyir/eyir/faq/:/faq/
    environment:
      - FB_ROOT=/faq/
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/eyir/
docker compose up -d
cd ~/