def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("mkdir -p ~/.ssh/")
    X("chmod 700 ~/.ssh/")
    X(f"ln -f -s {paths.configs.authorized_keys} ~/.ssh/")

    # TODO change back to $hostname and change aang to adam-macbook.local
    X(f"""sops -d --extract "['aang']['pri']" {paths.ssh_yaml} >~/.ssh/id_ed25519""")
    X(f"""sops -d --extract "['aang']['pub']" {paths.ssh_yaml} >~/.ssh/id_ed25519.pub""")
    X("chmod 600 ~/.ssh/id_ed25519")
    X("chmod 644 ~/.ssh/id_ed25519.pub")
