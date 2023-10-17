from shellrunner import X


def main():
    X(
        "curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher",
    )
    X("fisher install IlanCosman/tide")
    X("echo 2 1 2 3 1 1 1 1 1 1 1 y | tide configure >/dev/null")

    X("fisher install adamhl8/natural-selection")

    X("rye self completion -s fish >~/.config/fish/completions/rye.fish")


if __name__ == "__main__":
    main()
