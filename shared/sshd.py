def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("sudo find /etc/ssh/ -type f -name 'ssh_host_*' -delete")
    X('sudo ssh-keygen -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key -N ""')
    X('sudo ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""')

    X("awk '$5 >= 3071' /etc/ssh/moduli | sudo tee /etc/ssh/moduli.safe")

    X(f"sudo ln -f -s {paths.configs.sshd_config} /etc/ssh/")
    X("sudo sshd -T >/dev/null")
    X("sudo systemctl restart ssh")


if __name__ == "__main__":
    main()
