#!/bin/bash

mkdir ~/apps/eyir/

source ~/secrets
tee ~/apps/eyir/docker-compose.yml << EOF
version: "3"

services:
  eyir:
    image: ghcr.io/adamhl8/eyir
    container_name: eyir
    restart: always
    environment:
      - BOT_TOKEN=${eyir_token}
      - CLIENT_ID=320863841548238848
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/eyir/
docker compose up -d
cd ~/