def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("sudo apt install btrfs-progs -y")
    X("sudo apt install fuse -y")
    X("~/bin/mergerfs-update.py")

    X("sudo mkdir /mnt/disk{1,2,3}/")
    X("sudo mkdir /mnt/parity1/")
    X("sudo mkdir /mnt/storage/")

    X("sudo mkdir /etc/fstab.d/")
    X(f"sudo ln -s {paths.nodes.sid}/storage/mergerfs.fstab /etc/fstab.d/")

    X("sudo systemctl daemon-reload")
    X("sudo mount --fstab /etc/fstab.d/mergerfs.fstab -a")

    # cleanup
    X("sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot")
    X("sudo rm -rf /mnt/disk*/.snapshots/")
    X("sudo chown -R adam:adam /mnt/disk*")
    X(r"find /mnt/disk* -type d -exec sudo chmod 755 {} \;")
    X(r"find /mnt/disk* -type f -exec sudo chmod 644 {} \;")
