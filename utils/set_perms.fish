#!/usr/bin/env fish

set -l HOMELAB_ROOT (realpath (status dirname)/..)

find $HOMELAB_ROOT -type d -name "__pycache__" -exec rm -rf {} \;

find $HOMELAB_ROOT -type f -exec chmod 644 {} \;

find $HOMELAB_ROOT -type f -name "*.sh" -exec chmod 755 {} \;
find $HOMELAB_ROOT -type f -name "*.fish" -exec chmod 755 {} \;
find $HOMELAB_ROOT -type d -name "bin"  -exec chmod -R 755 {} \;

find $HOMELAB_ROOT -type f -name "fish_config.fish" -exec chmod 644 {} \;
find $HOMELAB_ROOT -type f -name "authorized_keys" -exec chmod 600 {} \;
chmod 755 $HOMELAB_ROOT/run.py
chmod 755 $HOMELAB_ROOT/X.py
