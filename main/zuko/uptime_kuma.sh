#!/bin/bash

mkdir ~/apps/uptime-kuma/

tee ~/apps/uptime-kuma/docker-compose.yml << EOF
version: "3"

services:
  uptime-kuma:
    image: louislam/uptime-kuma
    container_name: uptime-kuma
    restart: always
    ports:
      - 8004:3001
    volumes:
      - ./data/:/app/data/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/uptime-kuma/
docker compose up -d
cd ~/