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
