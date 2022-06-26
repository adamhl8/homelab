#!/bin/bash

mkdir ~/caddy/

tee ~/caddy/Caddyfile << EOF
ezaks.freemyip.com {
  reverse_proxy 100.124.4.7:8100
}
EOF