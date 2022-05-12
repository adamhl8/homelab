#!/bin/bash

mkdir ~/apps/n8n/

cp -r ~/backup/n8n/data/ ~/apps/n8n/

tee ~/apps/n8n/docker-compose.yml << EOF
version: "3"

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - 8003:5678
    volumes:
      - ./data/:/home/node/.n8n/
      - /home/adam/apps/eyir/:/eyir/
      - /home/adam/.ssh/:/home/node/.ssh/
    environment:
      - WEBHOOK_URL=https://n8n.adamhl.dev
      - N8N_USER_MANAGEMENT_DISABLED=true
EOF

cd ~/apps/n8n/
docker compose up -d
cd ~/

read -p "Waiting for n8n to start..." -t 5
echo

# Configure git in container
source ${modules}/bin/n8n-git