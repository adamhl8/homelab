from shellrunner import X


def main() -> None:
    X("fisher install jorgebucaran/nvm.fish")

    X(["nvm install latest", "npm install -g npm"])


if __name__ == "__main__":
    main()
