#!/bin/bash

mkdir ~/apps/minecraft/

tee ~/apps/minecraft/docker-compose.yml << EOF
version: "3"

services:
  minecraft:
    image: itzg/minecraft-server
    container_name: minecraft
    restart: always
    tty: true
    stdin_open: true
    ports:
      - 8013:25565
    volumes:
      - ./data/:/data/
    environment:
      - MEMORY=3G
      - EULA=TRUE
EOF

cd ~/apps/minecraft/
docker compose up -d
cd ~/

tee ~/bin/minecraft-stop << EOF
#!/bin/bash
docker exec minecraft rcon-cli stop
EOF
chmod 755 ~/bin/minecraft-stop