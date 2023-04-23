def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    # https://serverfault.com/questions/240897/how-to-properly-set-permissions-for-nfs-folder-permission-denied-on-mounting-en/241272

    X("sudo apt install nfs-kernel-server -y")
    X("sudo systemctl enable --now nfs-server")
    X(f"sudo ln -f -s {paths.nodes.sid}/nfs/exports /etc/exports")
    X("sudo exportfs -arv")


if __name__ == "__main__":
    main()
