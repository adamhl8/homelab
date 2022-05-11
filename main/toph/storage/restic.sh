#!/bin/bash

mkdir ~/restic/

curl -s https://api.github.com/repos/restic/restic/releases/latest | grep -o -E "https://(.*)restic(.*)linux_amd64.bz2" | sed 1q | xargs curl -Lo ~/restic/restic.bz2
bzip2 -d ~/restic/restic.bz2
chmod 755 ~/restic/restic

read -p "B2 Application Key: " b2_key
read -p "restic Password: " restic_password
tee ~/restic/restic-backup << EOF
#!/bin/bash
timestamp=\$(date +%F_%T)

(
exec &>~/restic/restic.log

export RESTIC_REPOSITORY=b2:toph-storage:/
export B2_ACCOUNT_ID=00420518bb341580000000001
export B2_ACCOUNT_KEY=${b2_key}
export RESTIC_PASSWORD=${restic_password}

echo "Starting restic backup..."
~/restic/restic backup /mnt/storage -vv --exclude-file ~/restic/excludes
echo "Cleaning up..."
~/restic/restic forget --prune --keep-within 1m
echo "Checking integrity..."
~/restic/restic check

sed -i '\|unchanged.*|d' ~/restic/restic.log
) || ~/msmtp/restic-log

mv ~/restic/restic.log ~/restic/\${timestamp}_restic.log
EOF
chmod 755 ~/restic/restic-backup

tee ~/restic/excludes << EOF
/mnt/storage/.snapshots/
/mnt/storage/Media/
/mnt/storage/Ventoy/
EOF