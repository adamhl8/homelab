def main():
    from hl_helpers import get_latest_github_release
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("mkdir -p ~/restic/")
    X(f"ln -f -s {paths.nodes.sid}/restic/excludes ~/restic/")
    X(f"ln -f -s {paths.nodes.sid}/restic/restic-backup.py ~/restic/")
    get_latest_github_release("restic/restic", r"restic.*linux_amd64\.bz2", "~/restic/restic.bz2")
    X("bzip2 -df ~/restic/restic.bz2")
    X("chmod 755 ~/restic/restic")


if __name__ == "__main__":
    main()
