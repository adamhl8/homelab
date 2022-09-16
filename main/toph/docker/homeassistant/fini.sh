#!/bin/bash

read -p "Waiting for Home Assistant to start..." -t 5
echo

sudo tee -a ~/docker/homeassistant/data/configuration.yaml << EOF
http:
  server_port: 8009
  use_x_forwarded_for: true
  trusted_proxies:
    - 127.0.0.1
    - ::1
EOF

docker restart homeassistant