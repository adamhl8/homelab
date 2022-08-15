#!/bin/bash

mkdir ~/apps/discord-app-bot/

echo "{}" | tee ~/apps/discord-app-bot/storage.json

source ~/secrets
tee ~/apps/discord-app-bot/docker-compose.yml << EOF
version: "3"

services:
  discord-app-bot:
    image: ghcr.io/adamhl8/discord-app-bot
    container_name: discord-app-bot
    restart: always
    volumes:
      - ./data/:/app/data/
    environment:
      - BOT_TOKEN=${discord_app_bot_token}
      - CLIENT_ID=970956137157492786
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/discord-app-bot/
docker compose up -d
cd ~/