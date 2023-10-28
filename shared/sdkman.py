from shellrunner import X


def main() -> None:
    X("curl -s 'https://get.sdkman.io?rcupdate=false' | bash")
    sdkman_fish()


def sdkman_fish() -> None:
    print("Installing fenv and omf-sdk...")
    X(
        [
            "curl -sLo ~/.config/fish/functions/fenv.main.fish https://raw.githubusercontent.com/oh-my-fish/plugin-foreign-env/master/functions/fenv.main.fish",
            "curl -sLo ~/.config/fish/functions/fenv.fish https://raw.githubusercontent.com/oh-my-fish/plugin-foreign-env/master/functions/fenv.fish",
            "curl -sLo ~/.config/fish/completions/sdk.fish https://raw.githubusercontent.com/deather/omf-sdk/master/completions/sdk.fish",
            "curl -sLo ~/.config/fish/functions/sdk.fish https://raw.githubusercontent.com/deather/omf-sdk/master/functions/sdk.fish",
        ],
    )


if __name__ == "__main__":
    main()
