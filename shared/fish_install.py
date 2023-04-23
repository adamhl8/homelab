import hl_helpers as helpers
from shellrunner import ShellCommandError, X

paths = helpers.homelab_paths


def main():
    X("mkdir -p ~/.config/fish/")
    X("mkdir -p ~/.config/fish/conf.d/")
    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")

    X("brew install fish")
    X('fish -c "$HOMEBREW_PREFIX/bin/brew shellenv >~/.config/fish/conf.d/homebrew.fish"')

    fish_path = "$HOMEBREW_PREFIX/bin/fish"
    try:
        X("grep -q fish /etc/shells")
    except ShellCommandError:
        X(f"echo {fish_path} | sudo tee -a /etc/shells > /dev/null")
        print(f"Added {fish_path} to /etc/shells")

    X(f"chsh -s {fish_path}")
    print(f"Set {fish_path} as default shell")


if __name__ == "__main__":
    main()
