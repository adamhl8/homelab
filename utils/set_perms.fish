#!/usr/bin/env fish

set -l homelab_root (realpath (status dirname)/..)

find $homelab_root -type f -exec chmod 644 {} \;

find $homelab_root -type f -name "*.sh" -exec chmod 755 {} \;
find $homelab_root -type f -name "*.fish" -exec chmod 755 {} \;
find $homelab_root -type d -name "bin"  -exec chmod -R 755 {} \;

find $homelab_root/shared/configs/ -type f -exec chmod 644 {} \;
find $homelab_root/shared/configs/ -type f -name "authorized_keys" -exec chmod 600 {} \;

chmod 755 $homelab_root/run.py
