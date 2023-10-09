import time

import hl_helpers as helpers
from shellrunner import X

helpers.generate_docker_env(["paperless_secret_key"], __file__)
X("docker compose pull")
X("docker compose up -d db")
time.sleep(15)
X("docker compose stop")
homelab_password = X("""sops -d --extract "['homelab_password']" ~/secrets.yaml""", show_output=False).out
X(
    f"docker compose run --rm -e DJANGO_SUPERUSER_PASSWORD='{homelab_password}' webserver createsuperuser --noinput --username 'adam' --email 'adamhl@pm.me'",
)
