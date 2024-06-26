from hl_helpers import get_latest_github_release
from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X("mkdir -p ~/restic/")
    X(f"ln -f -s {paths.nodes.sid}/nas/restic/excludes ~/restic/")
    X(f"ln -f -s {paths.nodes.sid}/nas/restic/restic_backup.py ~/restic/")
    X(f"ln -f -s {paths.nodes.sid}/nas/restic/restic-env.fish ~/restic/")
    get_latest_github_release("restic/restic", r"restic.*linux_amd64\.bz2", "~/restic/restic.bz2")
    X("bzip2 -df ~/restic/restic.bz2")
    X("chmod 755 ~/restic/restic")


if __name__ == "__main__":
    main()
