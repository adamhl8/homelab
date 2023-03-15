from shellrunner import X

X("sudo apt install btrfs-progs -y")

# data disks
X("sudo mkdir /mnt/disk{1,2,3}")
X('echo "LABEL=disk1 /mnt/disk1 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab')
X('echo "LABEL=disk2 /mnt/disk2 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab')
X('echo "LABEL=disk3 /mnt/disk3 btrfs subvol=/data 0 0" | sudo tee -a /etc/fstab')

# parity disk
X("sudo mkdir /mnt/parity1")
X('echo "LABEL=parity1 /mnt/parity1 ext4 defaults 0 0" | sudo tee -a /etc/fstab')

X("sudo systemctl daemon-reload")
X("sudo mount -a")

# cleanup
X("sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot")
X("sudo rm -rf /mnt/disk*/.snapshots/")
X("sudo chown -R adam:adam /mnt/disk*")
X(r"find /mnt/disk* -type d -exec sudo chmod 755 {} \;")
X(r"find /mnt/disk* -type f -exec sudo chmod 644 {} \;")

# mergerfs
X("sudo apt install fuse -y")
X("~/bin/mergerfs-update")
X("sudo mkdir /mnt/storage")
X(
    'echo "/mnt/disk* /mnt/storage fuse.mergerfs allow_other,use_ino,cache.files=off,dropcacheonclose=true,category.create=mfs,fsname=mergerfs 0 0" | sudo tee -a /etc/fstab',
)
X("sudo systemctl daemon-reload")
X("sudo mount -a")
