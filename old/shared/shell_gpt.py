from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X("rye install shell-gpt -f")
    X(f"ln -f -s {paths.configs.sgptrc} ~/.config/shell_gpt/")


if __name__ == "__main__":
    main()
