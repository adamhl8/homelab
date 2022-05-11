#!/bin/bash

mkdir -p ~/apps/discord-app-bot/build/
git clone git@github.com:adamhl8/discord-app-bot.git ~/apps/discord-app-bot/build/
cd ~/apps/discord-app-bot/build/
docker build . -t discord-app-bot
cd ~/

echo "{}" | tee ~/apps/discord-app-bot/storage.json

read -p "Bot Token: " bot_token
tee ~/apps/discord-app-bot/docker-compose.yml << EOF
version: "3"

services:
  discord-app-bot:
    image: discord-app-bot
    container_name: discord-app-bot
    restart: always
    volumes:
      - ./storage.json:/app/storage.json
    environment:
      - BOT_TOKEN=${bot_token}
      - CLIENT_ID=970956137157492786
EOF

cd ~/apps/discord-app-bot/
docker compose up -d
cd ~/