import hl_helpers as helpers
from shellrunner import X

paths = helpers.homelab_paths

os = helpers.get_os()


def install_common():
    if os == "linux":
        X("~/bin/system-update")
        X("sudo apt install git curl htop zip unzip -y")

        X(r'sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       $hostname.lan $hostname|" /etc/hosts')
    elif os == "macos":
        X("brew install git bash coreutils findutils gnu-tar gnu-sed gawk grep")


def install_micro():
    if os == "linux":
        X("sudo -v")
        X(
            [
                "cd /usr/bin/",
                "curl https://getmic.ro/r | sudo sh",
            ],
        )
    elif os == "macos":
        X("brew install micro")


def install_yq():
    if os == "linux":
        X(f"curl -Lo ~/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_{helpers.get_arch()}")
        X("chmod 755 ~/bin/yq")
    elif os == "macos":
        X("brew install yq")


def main():
    X(f"ln -s {paths.shared_bin} ~/")
    X(f"ln -s {paths.configs.git_config} ~/")

    install_common()

    X(
        [
            f"cd {paths.root}",
            "git remote set-url origin git@github.com:(git remote get-url origin | string replace 'https://github.com/' '')",
        ],
    )

    install_micro()
    install_yq()
