from hl_helpers import generate_docker_env
from shellrunner import X


def main() -> None:
    generate_docker_env(["github_homelab_api_token"], __file__)
    X("mkdir -p ~/docker/homelab-api/adamhl.dev/")


if __name__ == "__main__":
    main()
