from hl_helpers import generate_docker_env, substitute_vars


def main() -> None:
    generate_docker_env(["aws_access_key_id", "aws_secret_access_key"], __file__)
    substitute_vars("~/docker/caddy/users.json", ["caddy_security_2fa_secret"])


if __name__ == "__main__":
    main()
