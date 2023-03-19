from shellrunner import X

from run import NODE

X(f"ln -s {NODE}/snapraid/ ~/")

# snapraid
X("~/bin/snapraid-update")

# snapper
X("sudo apt install snapper -y")
X("sudo mkdir /etc/snapper/config-templates/")
X("sudo ln -s ~/snapraid/disk-snapper.conf /etc/snapper/config-templates/")
X("sudo snapper -c disk1 create-config -t disk-snapper.conf /mnt/disk1")
X("sudo snapper -c disk2 create-config -t disk-snapper.conf /mnt/disk2")
X("sudo snapper -c disk3 create-config -t disk-snapper.conf /mnt/disk3")
X("snapper list-configs")

# snapraid-btrfs
X("~/bin/snapraid-btrfs-update")
X("~/snapraid/snapraid-btrfs -c ~/snapraid/snapraid.conf ls")

# snapraid-btrfs-runner
X("~/bin/snapraid-btrfs-runner-update")
X(
    "sops exec-env ~/secrets.yaml 'envsubst < ~/snapraid/snapraid-btrfs-runner.conf | tee ~/snapraid/snapraid-btrfs-runner.conf > /dev/null'",
)
X("sudo ln -s ~/snapraid/snapraid-btrfs-runner.service /etc/systemd/system/")
X("sudo ln -s ~/snapraid/snapraid-btrfs-runner.timer /etc/systemd/system/")
X("sudo systemctl daemon-reload")
X("sudo systemctl enable snapraid-btrfs-runner.timer")
X("sudo systemctl start snapraid-btrfs-runner.timer")
