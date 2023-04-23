def main():
    from shellrunner import X

    X(
        "curl -sSL https://raw.githubusercontent.com/pdm-project/pdm/main/install-pdm.py | python -",
    )
    X("pdm completion fish >~/.config/fish/completions/pdm.fish")
    X("pdm --pep582 fish >~/.config/fish/conf.d/pdm.fish")


if __name__ == "__main__":
    main()
