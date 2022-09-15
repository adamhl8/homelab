#!/bin/bash

read -p "Waiting for Zigbee2MQTT to start..." -t 5
echo

sudo tee ~/docker/zigbee2mqtt/data/zigbee2mqtt/configuration.yaml << EOF
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