#!/bin/bash

# Set insecureAdminAccess
read -p "Waiting for Syncthing to start..." -t 5
echo
sed -i "\|<address>127\.0\.0\.1.*</address>|a\        <insecureAdminAccess>true</insecureAdminAccess>" ~/apps/syncthing/data/config/config.xml

docker restart syncthing