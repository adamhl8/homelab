#!/bin/bash

step1() {

source ${common}/debian_sid.sh
source ${common}/add_ssh_key.sh
source ${common}/ssh_perms.sh
source ${common}/alias_l.sh

sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       zuko|" /etc/hosts

# Argon fan script
curl https://download.argon40.com/argon1.sh | bash

reboot_prompt
}

step2() {

# AdGuard Home
curl -s -S -L https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/master/scripts/install.sh | sh -s -- -v

cat << EOF
  - Query logs retention: 24 hours
  - Upstream DNS: 
    - tls://1dot1dot1dot1.cloudflare-dns.com
    - [/lan/]192.168.1.1
  - Parallel requests
  - Bootstrap DNS:
    - 1.1.1.1
    - 1.0.0.1
  - Cache size: 10000000
  - Optimistic caching
EOF

continue_prompt

source ${common}/docker.sh

mkdir ~/uptime-kuma/

tee ~/uptime-kuma/docker-compose.yml << EOF
version: "3"

services:
  uptime-kuma:
    image: louislam/uptime-kuma
    container_name: uptime-kuma
    restart: always
    ports:
      - 8004:3001
    volumes:
      - ./data/:/app/data/
EOF

cd ~/uptime-kuma/
docker compose up -d
cd ~/
}

