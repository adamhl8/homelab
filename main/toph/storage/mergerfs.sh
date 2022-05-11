#!/bin/bash

sudo apt install fuse -y
curl -s https://api.github.com/repos/trapexit/mergerfs/releases/latest | grep -o -E "https://(.*)mergerfs(.*)debian-bullseye_amd64.deb" | sed 1q | xargs curl -Lo ~/mergerfs.deb
sudo apt install ~/mergerfs.deb -y
rm ~/mergerfs.deb
mergerfs --version

sudo mkdir /mnt/storage
echo "/mnt/disk* /mnt/storage fuse.mergerfs allow_other,use_ino,cache.files=off,dropcacheonclose=true,category.create=mfs,fsname=mergerfs 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a