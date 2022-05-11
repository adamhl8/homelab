#!/bin/bash

tee ~/caddy/Caddyfile << EOF
ezaks.freemyip.com {
  reverse_proxy 100.67.147.105:8100
}
EOF
~/caddy/caddy fmt -overwrite ~/caddy/Caddyfile