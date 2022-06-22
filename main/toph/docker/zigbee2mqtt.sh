#!/bin/bash

mkdir ~/apps/zigbee2mqtt/

tee ~/apps/zigbee2mqtt/docker-compose.yml << EOF
version: "3"

services:
  mqtt:
    image: eclipse-mosquitto:2.0
    container_name: mosquitto
    hostname: mqtt
    restart: always
    command: "mosquitto -c /mosquitto-no-auth.conf"
    volumes:
      - ./mosquitto/:/mosquitto/
    ports:
      - 1883:1883
      - 9001:9001

  zigbee2mqtt:
    image: koenkk/zigbee2mqtt
    container_name: zigbee2mqtt
    restart: always
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    ports:
      - 8016:8080
    volumes:
      - ./data/:/app/data/
      - /run/udev:/run/udev:ro
    environment:
      - TZ=America/Chicago
EOF

cd ~/apps/zigbee2mqtt/
docker compose up -d
cd ~/

read -p "Waiting for Zigbee2MQTT to start..." -t 5
echo

sudo tee ~/apps/zigbee2mqtt/data/configuration.yaml << EOF
permit_join: true

mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://mqtt

serial:
  port: /dev/ttyUSB0

frontend:
  port: 8080

advanced:
  network_key: GENERATE
EOF

docker restart zigbee2mqtt