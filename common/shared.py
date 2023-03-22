def main():
    from shellrunner import X

    from lib import hl_helpers
    from run import COMMON, HOMELAB_ROOT, NODE

    X(f"ln -s {COMMON}/bin/ ~/")
    if (NODE / "bin").is_dir():
        X(f"ln -s {NODE}/bin/* ~/bin/")

    X("~/bin/system-update")
    X("sudo apt install git curl htop zip unzip -y")

    X(r'sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       $hostname.lan $hostname|" /etc/hosts')

    X(f"ln -s {COMMON}/configs/.gitconfig ~/")

    X(
        [
            f"cd {HOMELAB_ROOT}",
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

    X(f"curl -Lo ~/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_{hl_helpers.get_arch()}")
    X("chmod 755 ~/bin/yq")
