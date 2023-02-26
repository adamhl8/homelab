#!/bin/bash

sudo apt install btrfs-progs -y

# data disks
sudo mkdir /mnt/disk{1,2,3}
echo "LABEL=disk1 /mnt/disk1 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk2 /mnt/disk2 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk3 /mnt/disk3 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab

# parity disk
sudo mkdir /mnt/parity1
echo "LABEL=parity1 /mnt/parity1 ext4 defaults 0 0" | sudo tee -a /etc/fstab

sudo systemctl daemon-reload
sudo mount -a

# cleanup
sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot
sudo rm -rf /mnt/disk*/.snapshots/
sudo chown -R adam:adam /mnt/disk*
find /mnt/disk* -type d -exec sudo chmod 755 {} \;
find /mnt/disk* -type f -exec sudo chmod 644 {} \;

# mergerfs
sudo apt install fuse -y
source ~/bin/mergerfs-update

sudo mkdir /mnt/storage
echo "/mnt/disk* /mnt/storage fuse.mergerfs allow_other,use_ino,cache.files=off,dropcacheonclose=true,category.create=mfs,fsname=mergerfs 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a
