#!/bin/bash

mkdir ~/apps/homarr/

tee ~/apps/homarr/docker-compose.yml << EOF
version: "3"

services:
  homarr:
    image: ghcr.io/ajnart/homarr
    container_name: homarr
    restart: always
    ports:
      - 8015:7575
    volumes:
      - ./data/configs/:/app/data/configs/
      - ./data/icons/:/app/public/icons/
    environment:
      - BASE_URL=homarr.adamhl.dev
EOF

cd ~/apps/homarr/
docker compose up -d
cd ~/