import time

from hl_helpers import generate_docker_env
from shellrunner import X


def main() -> None:
    generate_docker_env(["paperless_secret_key"], __file__)

    X("mkdir -p ~/docker/paperless-ngx/data/")
    X("mkdir -p ~/docker/paperless-ngx/consume/")
    X("mkdir -p ~/docker/paperless-ngx/export/")

    X("docker compose pull")
    X("docker compose up -d postgres")
    time.sleep(15)
    X("docker compose stop")
    homelab_password = X("""sops -d --extract "['homelab_password']" ~/secrets.yaml""", show_output=False).out
    X(
        f"docker compose run --rm -e DJANGO_SUPERUSER_PASSWORD='{homelab_password}' paperless-ngx createsuperuser --noinput --username 'adam' --email 'adamhl@pm.me'",  # noqa: E501
    )


if __name__ == "__main__":
    main()
