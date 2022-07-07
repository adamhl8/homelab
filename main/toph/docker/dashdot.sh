#!/bin/bash

mkdir ~/apps/dashdot/

tee ~/apps/dashdot/docker-compose.yml << EOF
version: "3"

services:
  dashdot:
    image: mauricenino/dashdot
    container_name: dashdot
    restart: always
    privileged: true
    ports:
      - 8005:3001
    volumes:
      - /:/mnt/host:ro
    environment:
      - DASHDOT_ACCEPT_OOKLA_EULA=true
      - DASHDOT_ENABLE_CPU_TEMPS=true
      - DASHDOT_ENABLE_STORAGE_SPLIT_VIEW=true
      - DASHDOT_FS_VIRTUAL_MOUNTS=mergerfs
      - DASHDOT_ALWAYS_SHOW_PERCENTAGES=true
      - DASHDOT_NETWORK_LABEL_LIST=type,speed_up,speed_down,interface_speed,public_ip
      - DASHDOT_OVERRIDE_OS=Debian sid
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/dashdot/
docker compose up -d
cd ~/