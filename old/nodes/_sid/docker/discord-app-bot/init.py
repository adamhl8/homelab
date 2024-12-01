from hl_helpers import generate_docker_env
from shellrunner import X


def main() -> None:
    generate_docker_env(["discord_app_bot_token"], __file__)
    X("mkdir ~/docker/discord-app-bot/data/")


if __name__ == "__main__":
    main()
