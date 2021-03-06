#!/bin/bash

mkdir ~/apps/ddns-route53/

source ~/secrets
tee ~/apps/ddns-route53/docker-compose.yml << EOF
version: "3"

services:
  ddns-route53:
    image: crazymax/ddns-route53
    container_name: ddns-route53
    restart: always
    environment:
      - "SCHEDULE=*/30 * * * *"
      - DDNSR53_CREDENTIALS_ACCESSKEYID=AKIAT5NKIWDOTLLLZ34R
      - DDNSR53_CREDENTIALS_SECRETACCESSKEY=${aws_secret_access_key}
      - DDNSR53_ROUTE53_HOSTEDZONEID=Z0001576IKPKC1SOE3BS
      - DDNSR53_ROUTE53_RECORDSSET_0_NAME=adamhl.dev
      - DDNSR53_ROUTE53_RECORDSSET_0_TYPE=A
      - DDNSR53_ROUTE53_RECORDSSET_0_TTL=60
      - DDNSR53_ROUTE53_RECORDSSET_1_NAME=*.adamhl.dev
      - DDNSR53_ROUTE53_RECORDSSET_1_TYPE=A
      - DDNSR53_ROUTE53_RECORDSSET_1_TTL=60
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
EOF

cd ~/apps/ddns-route53/
docker compose up -d
cd ~/