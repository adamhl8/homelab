#!/bin/bash

timestamp=$(date +%F_%T)

(
exec &>>~/restic/restic.log
set -e

source sops-source

export RESTIC_REPOSITORY=b2:toph-storage:/
export B2_ACCOUNT_ID=00420518bb341580000000001
export B2_ACCOUNT_KEY=${backblaze_application_key}
export RESTIC_PASSWORD=${restic_password}
export RESTIC_COMPRESSION=max
export RESTIC_PACK_SIZE=100

echo "Starting restic backup..."
~/restic/restic backup /mnt/storage -vv --exclude-file ~/restic/excludes
echo "Cleaning up..."
~/restic/restic forget --prune --keep-within 1m
echo "Checking integrity..."
~/restic/restic check
)
exit_status=$?

sed -i '\|unchanged.*|d' ~/restic/restic.log

[ ${exit_status} -ne 0 ] && source ~/msmtp/restic-log.sh

mv ~/restic/restic.log ~/restic/${timestamp}_restic.log
