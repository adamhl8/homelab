#!/bin/bash

source ~/secrets
tee ~/caddy/docker-compose.yml << EOF
version: "3"

services:
  caddy:
    build: .
    container_name: caddy
    restart: always
    network_mode: host
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data/:/data/
      - ./config/:/config/
    environment:
      - AWS_ACCESS_KEY_ID=AKIAT5NKIWDOTLLLZ34R
      - AWS_SECRET_ACCESS_KEY=${aws_secret_access_key}
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
docker restart caddy