#!/bin/bash

sudo tee /etc/systemd/system/caddy.service << EOF
[Unit]
Description=Caddy
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=${USER}
ExecStart=/home/${USER}/caddy/caddy run --environ --config /home/${USER}/caddy/Caddyfile
ExecReload=/home/${USER}/caddy/caddy reload --config /home/${USER}/caddy/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable caddy
sudo systemctl start caddy