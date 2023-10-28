from shellrunner import X


def main() -> None:
    X("fisher install jorgebucaran/nvm.fish")

    X("set -U nvm_default_version latest")
    X("set -U nvm_default_packages pnpm yarn")

    X(["nvm install latest", "npm install -g npm"])


def setup_pnpm() -> None:
    X("mkdir -p $PNPM_HOME")
    X("pnpm config set enable-pre-post-scripts=true")
    X("pnpm add -g npm-check-updates")
    X("pnpm login")


if __name__ == "__main__":
    main()
