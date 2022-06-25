#!/bin/bash

mkdir ~/ez/

tee -a ~/caddy/Caddyfile << EOF

:8100 {
  root * /home/adam/ez/
  file_server
}
EOF