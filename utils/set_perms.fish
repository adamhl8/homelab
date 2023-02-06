#!/usr/bin/env fish

set -l HOMELAB_ROOT (realpath (status dirname)/..)

find $HOMELAB_ROOT -type f -name "*.sh" -exec chmod 755 {} \;
find $HOMELAB_ROOT -type f -name "*.fish" -exec chmod 755 {} \;
find $HOMELAB_ROOT -type d -name "bin"  -exec chmod -R 755 {} \;

find $HOMELAB_ROOT -type f -name "config.fish" -exec chmod 644 {} \;
