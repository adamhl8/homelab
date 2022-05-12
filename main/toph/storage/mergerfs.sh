#!/bin/bash

sudo apt install fuse -y
source ${modules}/bin/mergerfs-update

sudo mkdir /mnt/storage
echo "/mnt/disk* /mnt/storage fuse.mergerfs allow_other,use_ino,cache.files=off,dropcacheonclose=true,category.create=mfs,fsname=mergerfs 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a