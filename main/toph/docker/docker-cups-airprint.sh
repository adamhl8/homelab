#!/bin/bash

mkdir ~/apps/docker-cups-airprint/

tee ~/apps/docker-cups-airprint/docker-compose.yml << EOF
version: "3"

services:
  docker-cups-airprint:
    image: drpsychick/airprint-bridge
    container_name: docker-cups-airprint
    restart: always
    network_mode: host
    devices:
      - /dev/bus/usb/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/docker-cups-airprint/
docker compose up -d
cd ~/

read -p "Waiting for docker-cups-airprint to start..." -t 3
echo
docker cp /mnt/storage/Stuff/Misc/ts202_driver.deb docker-cups-airprint:/
docker exec -it docker-cups-airprint apt update
docker exec -it docker-cups-airprint apt upgrade -y
docker exec docker-cups-airprint apt install /ts202_driver.deb