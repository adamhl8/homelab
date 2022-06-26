#!/bin/bash

tee ~/caddy/docker-compose.yml << EOF
version: "3"

services:
  caddy:
    image: caddy
    container_name: caddy
    restart: always
    network_mode: host
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data/:/data/
      - ./config/:/config/
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/caddy/
docker compose up -d
cd ~/

read -p "Waiting for Caddy to start..." -t 3
echo
docker exec caddy caddy fmt -overwrite /etc/caddy/Caddyfile
docker exec -w /etc/caddy/ caddy caddy reload