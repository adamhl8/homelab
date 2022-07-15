#!/bin/bash

mkdir ~/apps/cyberchef/

tee ~/apps/cyberchef/docker-compose.yml << EOF
version: "3"

services:
  cyberchef:
    image: mpepping/cyberchef
    container_name: cyberchef
    restart: always
    ports:
      - 8014:8000
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/cyberchef/
docker compose up -d
cd ~/