from hl_helpers import get_hostname
from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X("sudo find /etc/ssh/ -type f -name 'ssh_host_*' -delete")
    X('sudo ssh-keygen -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key -N ""')
    X('sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""')

    X("awk '$5 >= 4095' /etc/ssh/moduli | sudo tee /etc/ssh/moduli.safe >/dev/null")
    X("sudo mv /etc/ssh/moduli.safe /etc/ssh/moduli")

    X(f"sudo ln -f -s {paths.configs.sshd_config} /etc/ssh/")

    hostname = get_hostname()
    if hostname == "pve":
        X("sed -i -r 's|(permitrootlogin) no|\1 yes|' /etc/ssh/sshd_config")

    X("sudo sshd -T >/dev/null")
    X("sudo systemctl restart ssh")


if __name__ == "__main__":
    main()
