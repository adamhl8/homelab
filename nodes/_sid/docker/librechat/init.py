from hl_helpers import generate_docker_env
from shellrunner import X


def main() -> None:
    generate_docker_env(
        {
            "OPENAI_API_KEY": "openai_api_key",
            "CREDS_KEY": "librechat_creds_key",
            "CREDS_IV": "librechat_creds_iv",
            "JWT_SECRET": "librechat_jwt_secret",
            "JWT_REFRESH_SECRET": "librechat_jwt_refresh_secret",
        },
        __file__,
    )

    X("mkdir -p ~/docker/librechat/images")
    X("mkdir -p ~/docker/librechat/logs")
    X("mkdir -p ~/docker/librechat/data-node")


if __name__ == "__main__":
    main()
