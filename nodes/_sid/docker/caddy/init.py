import hl_helpers as helpers

helpers.generate_docker_env(["aws_access_key_id", "aws_secret_access_key"], __file__)
helpers.substitute_vars("~/docker/caddy/users.json", ["caddy_security_2fa_secret"])
