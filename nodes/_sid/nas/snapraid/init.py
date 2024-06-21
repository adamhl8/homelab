from hl_helpers import homelab_paths as paths
from shellrunner import ShellCommandError, X


def main() -> None:
    # snapraid
    X("mkdir -p ~/snapraid/")
    X("~/bin/snapraid_update.py")
    X(f"ln -f -s {paths.nodes.sid}/nas/snapraid/snapraid.conf ~/snapraid/")

    # cleanup
    try:
        X("sudo btrfs subvolume delete /mnt/disk*/.snapshots/*/snapshot")
    except ShellCommandError as e:
        if "No matches for wildcard" not in e.out:
            raise
    try:
        X("sudo rm -rf /mnt/disk*/.snapshots/")
    except ShellCommandError as e:
        if "No matches for wildcard" not in e.out:
            raise

    # snapper
    X("sudo apt purge --auto-remove snapper -y")
    X("sudo rm -rf /etc/snapper/")
    X("sudo apt install snapper -y")
    X("sudo mkdir -p /etc/snapper/config-templates/")
    X(f"sudo ln -f -s {paths.nodes.sid}/nas/snapraid/disk-snapper.conf /etc/snapper/config-templates/")
    X("sudo snapper -c disk1 create-config -t disk-snapper.conf /mnt/disk1")
    X("sudo snapper -c disk2 create-config -t disk-snapper.conf /mnt/disk2")
    X("sudo snapper -c disk3 create-config -t disk-snapper.conf /mnt/disk3")
    X("snapper list-configs")

    # snapraid-btrfs
    X("~/bin/snapraid_btrfs_update.py")
    X("~/snapraid/snapraid-btrfs -c ~/snapraid/snapraid.conf ls")

    # snapraid-btrfs-runner
    X("~/bin/snapraid_btrfs_runner_update.py")
    X(f"ln -f -s {paths.nodes.sid}/nas/snapraid/snapraid-btrfs-runner.conf ~/snapraid/")


if __name__ == "__main__":
    main()
