#!/bin/bash

mkdir ~/apps/ward/

tee ~/apps/ward/docker-compose.yml << EOF
version: "3"

services:
  ward:
    image: antonyleons/ward
    container_name: ward
    restart: always
    privileged: true
    ports:
      - 8005:4000
    environment:
      - WARD_NAME=toph
      - WARD_THEME=dark
      - WARD_PORT=4000
EOF

cd ~/apps/ward/
docker compose up -d
cd ~/