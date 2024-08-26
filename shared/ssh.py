from hl_helpers import get_hostname
from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X("mkdir -p ~/.ssh/")
    X("chmod 700 ~/.ssh/")
    X(f"ln -f -s {paths.configs.authorized_keys} ~/.ssh/")
    X(f"ln -f -s {paths.configs.allowed_signers} ~/.ssh/")

    hostname = get_hostname()
    X(f"""sops -d --extract "['{hostname}']['pri']" {paths.ssh_yaml} >~/.ssh/id_ed25519""")
    X(f"""sops -d --extract "['{hostname}']['pub']" {paths.ssh_yaml} >~/.ssh/id_ed25519.pub""")
    X("chmod 600 ~/.ssh/id_ed25519")
    X("chmod 644 ~/.ssh/id_ed25519.pub")


if __name__ == "__main__":
    main()
