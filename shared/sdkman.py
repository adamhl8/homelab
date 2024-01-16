from shellrunner import X


def main() -> None:
    X("curl -s 'https://get.sdkman.io?rcupdate=false' | bash")


if __name__ == "__main__":
    main()
