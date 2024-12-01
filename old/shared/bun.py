from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    X("brew install oven-sh/bun/bun")
    # sudo apt install unzip
    # curl -fsSL https://bun.sh/install | bash
    # fix the fact that bun appends to fish config

    X("bun add -g yarn")
    X("bun add -g npm-check-updates")
    X("bun add -g pyright")

    X("bun add -g prettier")
    X("bun add -g prettier-plugin-sh")
    X("bun add -g prettier-plugin-toml")
    X(f"ln -f -s {paths.configs.prettier_config} ~/.prettierrc.mjs")


if __name__ == "__main__":
    main()
