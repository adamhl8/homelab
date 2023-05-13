def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("sudo apt install btrfs-progs -y")
    X("sudo apt install fuse -y")
    X("~/bin/mergerfs-update.py")

    X("sudo mkdir -p /mnt/disk{1,2,3}/")
    X("sudo mkdir -p /mnt/parity1/")
    X("sudo mkdir -p /mnt/storage/")

    status = X(f'grep -qxF "$(cat {paths.nodes.sid}/storage/mergerfs.fstab)" /etc/fstab', check=False).status
    if status != 0:
        X(f"cat {paths.nodes.sid}/storage/mergerfs.fstab | sudo tee -a /etc/fstab >/dev/null")
    X("sudo systemctl daemon-reload")
    X("sudo mount -a")

    # cleanup
    X("sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot")
    X("sudo rm -rf /mnt/disk*/.snapshots/")
    X("sudo chown -R adam:adam /mnt/disk*")
    X(r"find /mnt/disk* -type d -exec sudo chmod 755 {} \;")
    X(r"find /mnt/disk* -type f -exec sudo chmod 644 {} \;")


if __name__ == "__main__":
    main()
