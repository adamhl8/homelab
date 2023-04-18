#!/usr/bin/env fish

set -l homelab_root (realpath (status dirname)/..)

find $homelab_root -type f -exec chmod 644 {} \;
find $homelab_root -type d -name "bin"  -exec chmod -R 755 {} \;

find $homelab_root -type f -name "authorized_keys" -exec chmod 600 {} \;
chmod 755 $homelab_root/init.bash
chmod 755 $homelab_root/run.py
chmod 755 $homelab_root/utils/set_perms.fish
