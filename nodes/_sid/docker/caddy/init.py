import hl_helpers as helpers
from shellrunner import X

helpers.generate_docker_env(["aws_secret_access_key"], __file__)
X(
    r"""cat ~/docker/caddy/users.json | string replace '${caddy_security_2fa_secret}' (sops -d --extract "['caddy_security_2fa_secret']" ~/secrets.yaml) | tee ~/docker/caddy/users.json > /dev/null""",
)
