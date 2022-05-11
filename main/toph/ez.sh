#!/bin/bash

mkdir ~/ez/

docker run -t -v /mnt/storage/Other/Z/Z/elizabethzaks/:/input/:ro -v ~/ez/:/output/ ghcr.io/thumbsup/thumbsup thumbsup --input /input/ --output /output/ --sort-albums-by title --sort-media-by filename --title "Elizabeth Zaks" --home-album-name "Elizabeth Zaks" --theme flow --cleanup

tee ~/caddy/ez.caddy << EOF
:8100 {
  root * /home/adam/ez/
  file_server
}
EOF
caddy fmt -overwrite ~/caddy/ez.caddy

tee -a ~/caddy/Caddyfile << EOF
import /home/adam/caddy/ez.caddy
EOF
caddy fmt -overwrite ~/caddy/Caddyfile

sudo systemctl reload caddy