def main():
    import hl_helpers as helpers
    from shellrunner import X

    paths = helpers.homelab_paths

    X(f"ln -s {paths.shared_bin} ~/")

    X("~/bin/system-update")
    X("sudo apt install git curl htop zip unzip -y")

    X(r'sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       $hostname.lan $hostname|" /etc/hosts')

    X(f"ln -s {paths.configs.git_config} ~/")

    X(
        [
            f"cd {paths.root}",
            "git remote set-url origin git@github.com:(git remote get-url origin | string replace 'https://github.com/' '')",
        ],
    )

    X("sudo -v")
    X(
        [
            "cd /usr/bin/",
            "curl https://getmic.ro/r | sudo sh",
        ],
    )

    X(f"curl -Lo ~/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_{helpers.get_arch()}")
    X("chmod 755 ~/bin/yq")
