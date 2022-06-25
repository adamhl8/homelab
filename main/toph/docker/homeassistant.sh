#!/bin/bash

mkdir ~/apps/homeassistant/

tee ~/apps/homeassistant/docker-compose.yml << EOF
version: "3"

services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: homeassistant
    restart: always
    privileged: true
    network_mode: host
    volumes:
      - ./data/:/config/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/homeassistant/
docker compose up -d
cd ~/

read -p "Waiting for Home Assistant to start..." -t 5
echo

sudo tee -a ~/apps/homeassistant/data/configuration.yaml << EOF
http:
  server_port: 8009
  use_x_forwarded_for: true
  trusted_proxies:
    - 127.0.0.1
    - ::1
EOF

docker restart homeassistant