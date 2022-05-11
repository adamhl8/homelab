#!/bin/bash

sudo apt install snapper -y

sudo mkdir /etc/snapper/config-templates/
sudo tee /etc/snapper/config-templates/disk << EOF
SUBVOLUME="/"

FSTYPE="btrfs"
QGROUP=""
SPACE_LIMIT="0.5"
FREE_LIMIT="0.2"

ALLOW_USERS="adam"
ALLOW_GROUPS=""
SYNC_ACL="yes"

BACKGROUND_COMPARISON="yes"

NUMBER_CLEANUP="yes"
NUMBER_MIN_AGE="1800"
NUMBER_LIMIT="50"
NUMBER_LIMIT_IMPORTANT="10"

TIMELINE_CREATE="no"
TIMELINE_CLEANUP="yes"
TIMELINE_MIN_AGE="1800"
TIMELINE_LIMIT_HOURLY="10"
TIMELINE_LIMIT_DAILY="10"
TIMELINE_LIMIT_WEEKLY="0"
TIMELINE_LIMIT_MONTHLY="10"
TIMELINE_LIMIT_YEARLY="10"

EMPTY_PRE_POST_CLEANUP="yes"
EMPTY_PRE_POST_MIN_AGE="1800"
EOF

sudo snapper -c disk1 create-config -t disk /mnt/disk1
sudo snapper -c disk2 create-config -t disk /mnt/disk2
sudo snapper -c disk3 create-config -t disk /mnt/disk3
snapper list-configs