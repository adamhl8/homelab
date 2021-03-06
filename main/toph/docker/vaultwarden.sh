#!/bin/bash

mkdir ~/apps/vaultwarden/

source ~/secrets
tee ~/apps/vaultwarden/docker-compose.yml << EOF
version: "3"

services:
  vaultwarden:
    image: vaultwarden/server
    container_name: vaultwarden
    restart: always
    ports:
      - 8000:80
    volumes:
      - ./data/:/data/
    environment:
      - DOMAIN=https://vault.adamhl.dev
      - ADMIN_TOKEN=${vaultwarden_admin_token}
      - TRASH_AUTO_DELETE_DAYS=30
      - SMTP_HOST=email-smtp.us-east-1.amazonaws.com
      - SMTP_FROM=vaultwarden@adamhl.dev
      - SMTP_USERNAME=AKIAT5NKIWDOTLLLZ34R
      - SMTP_PASSWORD=${smtp_password}
      - IP_HEADER=X-Forwarded-For
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/vaultwarden/
docker compose up -d
cd ~/