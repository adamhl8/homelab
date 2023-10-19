from hl_helpers import generate_docker_env
from shellrunner import X


def main():
    generate_docker_env(["eyir_token"], __file__)

    X("mkdir ~/dev/")
    X(["cd ~/dev/", "git clone git@github.com:adamhl8/eyir.git"])
    X("mkdir ~/docker/eyir/data/")
    X("touch ~/docker/eyir/data/filebrowser.db")


if __name__ == "__main__":
    main()
