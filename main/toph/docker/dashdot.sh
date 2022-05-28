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
    network_mode: host
    environment:
      - DASHDOT_PORT=8005
      - DASHDOT_ENABLE_CPU_TEMPS=true
      - DASHDOT_STORAGE_WIDGET_ENABLE=false
      - DASHDOT_NETWORK_WIDGET_MIN_WIDTH=1200
      - DASHDOT_OVERRIDE_OS=Debian sid
EOF

cd ~/apps/dashdot/
docker compose up -d
cd ~/