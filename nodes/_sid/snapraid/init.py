def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    # snapraid
    X("mkdir -p ~/snapraid/")
    X("~/bin/snapraid-update.py")
    X(f"ln -s {paths.nodes.sid}/snapraid/snapraid.conf ~/snapraid/")

    # snapper
    X("sudo apt install snapper -y")
    X("sudo mkdir -p /etc/snapper/config-templates/")
    X(f"sudo ln -s {paths.nodes.sid}/snapraid/disk-snapper.conf /etc/snapper/config-templates/")
    X("sudo snapper -c disk1 create-config -t disk-snapper.conf /mnt/disk1")
    X("sudo snapper -c disk2 create-config -t disk-snapper.conf /mnt/disk2")
    X("sudo snapper -c disk3 create-config -t disk-snapper.conf /mnt/disk3")
    X("snapper list-configs")

    # snapraid-btrfs
    X("~/bin/snapraid-btrfs-update.py")
    X("~/snapraid/snapraid-btrfs -c ~/snapraid/snapraid.conf ls")

    # snapraid-btrfs-runner
    X("~/bin/snapraid-btrfs-runner-update.py")
    X(f"ln -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.conf ~/snapraid/")
    X(
        "sops exec-env ~/secrets.yaml 'envsubst < ~/snapraid/snapraid-btrfs-runner.conf | tee ~/snapraid/snapraid-btrfs-runner.conf > /dev/null'",
    )
    X(f"sudo ln -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.service /etc/systemd/system/")
    X(f"sudo ln -s {paths.nodes.sid}/snapraid/snapraid-btrfs-runner.timer /etc/systemd/system/")
    X("sudo systemctl daemon-reload")
    X("sudo systemctl enable snapraid-btrfs-runner.timer")
    X("sudo systemctl start snapraid-btrfs-runner.timer")
