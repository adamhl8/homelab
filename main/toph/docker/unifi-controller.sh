#!/bin/bash

mkdir ~/apps/unifi-controller/

tee ~/apps/unifi-controller/docker-compose.yml << EOF
version: "3"

services:
  unifi-controller:
    image: lscr.io/linuxserver/unifi-controller
    container_name: unifi-controller
    restart: always
    network_mode: host
    volumes:
      - ./data/:/config/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/unifi-controller/
docker compose up -d
cd ~/