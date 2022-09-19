#!/bin/bash

# snapraid
source ~/bin/snapraid-update

# snapper
sudo apt install snapper -y
sudo mkdir /etc/snapper/config-templates/
sudo ln -s ~/snapraid/disk-snapper.conf /etc/snapper/config-templates/
sudo snapper -c disk1 create-config -t disk-snapper.conf /mnt/disk1
sudo snapper -c disk2 create-config -t disk-snapper.conf /mnt/disk2
sudo snapper -c disk3 create-config -t disk-snapper.conf /mnt/disk3
snapper list-configs

# snapraid-btrfs
source ~/bin/snapraid-btrfs-update
~/snapraid/snapraid-btrfs -c ~/snapraid/snapraid.conf ls

# snapraid-btrfs-runner
source ~/bin/snapraid-btrfs-runner-update
sops exec-env ~/secrets.env 'envsubst < ~/snapraid/snapraid-btrfs-runner.conf | tee ~/snapraid/snapraid-btrfs-runner.conf > /dev/null'

sudo ln -s ~/snapraid/snapraid-btrfs-runner.service /etc/systemd/system/
sudo ln -s ~/snapraid/snapraid-btrfs-runner.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable snapraid-btrfs-runner.timer
sudo systemctl start snapraid-btrfs-runner.timer
