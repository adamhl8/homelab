import hl_helpers as helpers
from shellrunner import X

helpers.generate_docker_env(["aws_secret_access_key", "caddy_zerossl_key"], __file__)
X("sops exec-env ~/secrets.yaml 'envsubst < ~/docker/caddy/users.json | tee ~/docker/caddy/users.json > /dev/null'")
