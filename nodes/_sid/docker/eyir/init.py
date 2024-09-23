from hl_helpers import generate_docker_env
from shellrunner import X


def main() -> None:
    generate_docker_env(["eyir_token"], __file__)
    X("mkdir ~/docker/eyir/data/")


if __name__ == "__main__":
    main()
