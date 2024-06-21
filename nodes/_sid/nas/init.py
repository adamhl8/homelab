from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X(f"sudo ln -f -s {paths.nodes.sid}/nas/nas-backup.service /etc/systemd/system/")
    X(f"sudo ln -f -s {paths.nodes.sid}/nas/nas-backup.timer /etc/systemd/system/")

    X("sudo systemctl daemon-reload")
    X("sudo systemctl enable nas-backup.timer")
    X("sudo systemctl start nas-backup.timer")


if __name__ == "__main__":
    main()
