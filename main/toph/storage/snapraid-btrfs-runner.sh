#!/bin/bash

source ${modules}/bin/snapraid-btrfs-runner-update

read -p "SMTP Password: " smtp_password
tee ~/snapraid/snapraid-btrfs-runner.conf << EOF
[snapraid-btrfs]
executable = /home/adam/snapraid/snapraid-btrfs
pool = false
cleanup = true

[snapper]
executable = /usr/bin/snapper

[snapraid]
executable = /usr/local/bin/snapraid
config = /home/adam/snapraid/snapraid.conf
deletethreshold = -1
touch = true

[logging]
file = /home/adam/snapraid/snapraid.log
maxsize = 5000

[email]
sendon = error
short = false
subject = [SnapRAID] Status Report:
from = snapraid-btrfs-runner@adamhl.dev
to = adamhl@pm.me
maxsize = 5000

[smtp]
host = email-smtp.us-east-1.amazonaws.com
port = 587
ssl = false
tls = true
user = AKIAT5NKIWDOTLLLZ34R
password = ${smtp_password}

[scrub]
enabled = true
plan = 10
older-than = 10
EOF

sudo tee /etc/systemd/system/snapraid-btrfs-runner.service << EOF
[Unit]
Description=snapraid-btrfs-runner

[Service]
Type=oneshot
User=adam
ExecStart=python3 /home/adam/snapraid/snapraid-btrfs-runner.py -c /home/adam/snapraid/snapraid-btrfs-runner.conf
ExecStartPost=/home/adam/restic/restic-backup
EOF

sudo tee /etc/systemd/system/snapraid-btrfs-runner.timer << EOF
[Unit]
Description=Run snapraid-btrfs-runner every night

[Timer]
OnCalendar=*-*-* 08:00:00

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable snapraid-btrfs-runner.timer
sudo systemctl start snapraid-btrfs-runner.timer