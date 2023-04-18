from shutil import which

import hl_helpers as helpers
from shellrunner import ShellCommandError, X

paths = helpers.homelab_paths

os = helpers.get_os()


def install_fish():
    X("mkdir -p ~/.config/fish/")
    X("mkdir -p ~/.config/fish/conf.d/")
    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")

    if os == "linux":
        X("sudo mkdir -p /etc/apt/keyrings")

        gpg_key = "https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key"
        source = "http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /"

        distro = helpers.get_distro()
        if distro == "ubuntu":
            gpg_key = "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x59fda1ce1b84b3fad89366c027557f056dc33ca5"
            source = "https://ppa.launchpadcontent.net/fish-shell/release-3/ubuntu $(lsb_release -cs) main"

        X(
            f"curl -fsSL '{gpg_key}' | sudo gpg --dearmor -o /etc/apt/keyrings/fish.gpg",
        )
        X(
            f'echo "deb [signed-by=/etc/apt/keyrings/fish.gpg] {source}" | sudo tee /etc/apt/sources.list.d/fish.list > /dev/null',
        )

        X("sudo apt update")
        X("sudo apt install fish -y")
    elif os == "macos":
        X("brew install fish")
        X("fish -c '/opt/homebrew/bin/brew shellenv >~/.config/fish/conf.d/homebrew.fish'")


def get_fish_path():
    fish_path = None
    if os == "linux":
        fish_path = which("fish")
    elif os == "macos":
        fish_path = "/opt/homebrew/bin/fish"

    if fish_path is None:
        message = "Failed to resolve fish path."
        raise RuntimeError(message)

    return fish_path


def change_default_shell():
    fish_path = get_fish_path()
    try:
        X("grep -q fish /etc/shells")
    except ShellCommandError:
        X(f"echo {fish_path} | sudo tee -a /etc/shells > /dev/null")
        print(f"Added {fish_path} to /etc/shells")

    X(f"chsh -s {fish_path}")
    print(f"Set {fish_path} as default shell")


def main():
    install_fish()
    change_default_shell()
