from shellrunner import X


def main():
    X('curl -sSf https://rye-up.com/get | RYE_INSTALL_OPTION="--yes" bash')
    X("rye self completion -s fish >~/.config/fish/completions/rye.fish")


if __name__ == "__main__":
    main()
