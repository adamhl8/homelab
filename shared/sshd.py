def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X(f"sudo ln -f -s {paths.configs.sshd_config} /etc/ssh/")
    X("sudo systemctl restart ssh")


if __name__ == "__main__":
    main()
