#!/bin/bash

mkdir ~/apps/searxng/

tee ~/apps/searxng/docker-compose.yml << EOF
version: "3"

services:
  searxng:
    image: searxng/searxng
    container_name: searxng
    restart: always
    ports:
      - 8009:8080
    volumes:
      - ./data/:/etc/searxng/
    environment:
      - BASE_URL=https://search.adamhl.dev
EOF

cd ~/apps/searxng/
docker compose up -d
cd ~/