#!/bin/bash

mkdir ~/apps/syncthing/

tee ~/apps/syncthing/docker-compose.yml << EOF
version: "3"

services:
  syncthing:
    image: syncthing/syncthing
    container_name: syncthing
    restart: always
    command: -no-default-folder
    ports:
      - 8001:8384
      - 22000:22000/tcp
      - 22000:22000/udp
      - 21027:21027/udp
    volumes:
      - ./data/:/var/syncthing/
      - /mnt/storage/Stuff/:/Stuff/
      - /mnt/storage/Apps/:/Apps/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/syncthing/
docker compose up -d
cd ~/

# Set insecureAdminAccess
read -p "Waiting for Syncthing to start..." -t 5
echo
sed -i "\|<address>127\.0\.0\.1.*</address>|a\        <insecureAdminAccess>true</insecureAdminAccess>" ~/apps/syncthing/data/config/config.xml

docker restart syncthing