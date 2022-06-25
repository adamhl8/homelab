#!/bin/bash

mkdir ~/apps/cupsd/

tee ~/apps/cupsd/docker-compose.yml << EOF
version: "3"

services:
  cupsd:
    image: olbat/cupsd
    container_name: cupsd
    restart: always
    devices:
      - /dev/bus/usb/
    ports:
      - 631:631
    volumes:
      - /var/run/dbus:/var/run/dbus
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/cupsd/
docker compose up -d
cd ~/

read -p "Waiting for cupsd to start..." -t 3
echo
docker cp /mnt/storage/Stuff/Misc/ts202_driver.deb cupsd:/
docker exec cupsd apt install /ts202_driver.deb