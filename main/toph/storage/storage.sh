#!/bin/bash

sudo apt install btrfs-progs -y

# Data disks
sudo mkdir /mnt/disk{1,2,3}
echo "LABEL=disk1 /mnt/disk1 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk2 /mnt/disk2 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk3 /mnt/disk3 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a

# Parity disk
sudo mkdir /mnt/parity1
echo "LABEL=parity1 /mnt/parity1 ext4 defaults 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a

# Cleanup
sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot
sudo rm -rf /mnt/disk*/.snapshots/
sudo chown -R adam:adam /mnt/disk*
find /mnt/disk* -type d -exec sudo chmod 755 {} \;
find /mnt/disk* -type f -exec sudo chmod 644 {} \;