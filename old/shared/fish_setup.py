from shellrunner import X


def main() -> None:
    X(
        "curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher",  # noqa: E501
    )

    X("fisher install IlanCosman/tide")
    X("echo 2 1 2 3 1 1 1 1 1 1 1 y | tide configure >/dev/null")

    X("fisher install daleeidd/natural-selection")
    X("fisher install PatrickF1/fzf.fish")

    install_rye_completions()


def install_rye_completions() -> None:
    X("rye self completion -s fish >~/.config/fish/completions/rye.fish")


if __name__ == "__main__":
    main()
