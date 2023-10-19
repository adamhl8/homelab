from hl_helpers import generate_docker_env


def main():
    generate_docker_env(["vaultwarden_admin_token", "aws_access_key_id", "smtp_password"], __file__)


if __name__ == "__main__":
    main()
