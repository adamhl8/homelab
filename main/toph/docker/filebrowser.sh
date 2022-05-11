#!/bin/bash

mkdir ~/apps/filebrowser/
touch ~/apps/filebrowser/filebrowser.db

tee ~/apps/filebrowser/docker-compose.yml << EOF
version: "3"

services:
  filebrowser:
    image: filebrowser/filebrowser
    container_name: filebrowser
    restart: always
    ports:
      - 8002:80
    volumes:
      - ./filebrowser.db:/database.db
      - /mnt/storage/:/Storage/
    environment:
      - FB_ROOT=/Storage/
      - FB_NOAUTH=true
EOF

cd ~/apps/filebrowser/
docker compose up -d
cd ~/