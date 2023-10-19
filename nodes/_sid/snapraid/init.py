from hl_helpers import homelab_paths as paths
from hl_helpers import substitute_vars
from shellrunner import X


def main():
    # snapraid
    X("mkdir -p ~/snapraid/")
    X("~/bin/snapraid-update.py")
    X(f"ln -f -s {paths.nodes.sid}/snapraid/snapraid.conf ~/snapraid/")

    # snapper
    X("sudo apt purge --auto-remove snapper -y")
    X("sudo rm -rf /etc/snapper/")
    X("sudo apt install snapper -y")
    X("sudo mkdir -p /etc/snapper/config-templates/")
    X(f"sudo ln -f -s {paths.nodes.sid}/snapraid/disk-snapper.conf /etc/snapper/config-templates/")
    X("sudo snapper -c disk1 create-config -t disk-snapper.conf /mnt/disk1")
    X("sudo snapper -c disk2 create-config -t disk-snapper.conf /mnt/disk2")
    X("sudo snapper -c disk3 create-config -t disk-snapper.conf /mnt/disk3")
    X("snapper list-configs")

    # snapraid-btrfs
    X("~/bin/snapraid-btrfs-update.py")
    X("~/snapraid/snapraid-btrfs -c ~/snapraid/snapraid.conf ls")

    # snapraid-btrfs-runner
    X("~/bin/snapraid-btrfs-runner-update.py")
    X(f"ln -f -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.conf ~/snapraid/")
    substitute_vars("~/snapraid/snapraid-btrfs-runner.conf", ["aws_access_key_id", "smtp_password"])
    X(f"sudo ln -f -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.service /etc/systemd/system/")
    X(f"sudo ln -f -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.timer /etc/systemd/system/")
    X("sudo systemctl daemon-reload")
    X("sudo systemctl enable snapraid-btrfs-runner.timer")
    X("sudo systemctl start snapraid-btrfs-runner.timer")


if __name__ == "__main__":
    main()
