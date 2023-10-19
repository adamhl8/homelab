from shellrunner import X


def main():
    X("mkdir ~/docker/filebrowser/data/")
    X("touch ~/docker/filebrowser/data/filebrowser.db")


if __name__ == "__main__":
    main()
