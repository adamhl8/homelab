## Initialize Disks

### Format

```bash
sudo gdisk /dev/sdX
```

- `o`, `n` (defaults), `w`

```bash
# Data disks
sudo mkfs.btrfs -L diskX /dev/sdX1

# Parity disk
sudo mkfs.ext4 -L parity1 /dev/sdX1
```

### Subvolumes

```bash
sudo mkdir -p /mnt/btrfs-roots/disk{1,2,3}
echo "LABEL=disk1 /mnt/btrfs-roots/disk1 btrfs defaults 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk2 /mnt/btrfs-roots/disk2 btrfs defaults 0 0" | sudo tee -a /etc/fstab
echo "LABEL=disk3 /mnt/btrfs-roots/disk3 btrfs defaults 0 0" | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a

sudo btrfs subvolume create /mnt/btrfs-roots/disk1/data
sudo btrfs subvolume create /mnt/btrfs-roots/disk2/data
sudo btrfs subvolume create /mnt/btrfs-roots/disk3/data

# Unmount btrfs roots
sudo sed -i "\|LABEL=disk[[:digit:]] /mnt/btrfs-roots/disk[[:digit:]] btrfs defaults 0 0|d" /etc/fstab
sudo umount /mnt/btrfs-roots/disk*
```
