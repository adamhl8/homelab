#!/bin/bash

mkdir ~/ez/

tee -a ~/caddy/Caddyfile << EOF

:8100 {
  root * /ez/
  file_server
}
EOF