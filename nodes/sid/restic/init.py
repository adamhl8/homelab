def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("mkdir -p ~/restic/")
    X(f"ln -s {paths.nodes.sid}/restic/excludes ~/restic/")
    X(f"ln -s {paths.nodes.sid}/restic/restic-backup.py ~/restic/")
    X(
        'curl -s https://api.github.com/repos/restic/restic/releases/latest | string match -r "https://.*/download/.*restic.*linux_amd64.bz2" | sed 1q | xargs curl -Lo ~/restic/restic.bz2',
    )
    X("bzip2 -d ~/restic/restic.bz2")
    X("chmod 755 ~/restic/restic")