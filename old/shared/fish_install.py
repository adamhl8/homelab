from hl_helpers import homelab_paths as paths
from shellrunner import ShellCommandError, X


def main() -> None:
    X("mkdir -p ~/.config/fish/conf.d/")
    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")

    X("brew install fish")
    X("$HOMEBREW_PREFIX/bin/brew shellenv fish >~/.config/fish/conf.d/homebrew.fish")

    fish_path = "$HOMEBREW_PREFIX/bin/fish"
    try:
        X("grep -q fish /etc/shells")
    except ShellCommandError:
        X(f"echo {fish_path} | sudo tee -a /etc/shells >/dev/null")
        print(f"Added {fish_path} to /etc/shells")

    X(f"chsh -s {fish_path}")
    print(f"Set {fish_path} as default shell")


if __name__ == "__main__":
    main()

"""
add_apt_source
https://software.opensuse.org/download.html?project=shells:fish:release:3&package=fish
sudo apt install gpg -y
curl -fsSL 'https://download.opensuse.org/repositories/shells:fish:release:3/Debian_12/Release.key' | sudo gpg --dearmor -o /etc/apt/keyrings/shells_fish_release_3.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/shells_fish_release_3.gpg] http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_12/ /" | sudo tee /etc/apt/sources.list.d/shells_fish_release_3.list >/dev/null
sudo apt update
sudo apt install fish -y
"""
