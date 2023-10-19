from hl_helpers import generate_docker_env


def main():
    generate_docker_env(["aws_access_key_id", "aws_secret_access_key"], __file__)


if __name__ == "__main__":
    main()
