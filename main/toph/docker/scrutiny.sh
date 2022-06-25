#!/bin/bash

sudo apt install smartmontools

mkdir ~/apps/scrutiny/

tee ~/apps/scrutiny/docker-compose.yml << EOF
version: "3"

services:
  scrutiny:
    image: ghcr.io/analogj/scrutiny:master-omnibus
    container_name: scrutiny
    restart: always
    cap_add:
      - SYS_RAWIO
      - SYS_ADMIN
    devices:
      - /dev/sda
      - /dev/sdb
      - /dev/sdc
      - /dev/sdd
      - /dev/nvme0
    ports:
      - 8010:8080
    volumes:
      - ./data/:/opt/scrutiny/config/
      - ./influxdb/:/opt/scrutiny/influxdb/
      - /run/udev:/run/udev:ro
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/scrutiny/
docker compose up -d
cd ~/