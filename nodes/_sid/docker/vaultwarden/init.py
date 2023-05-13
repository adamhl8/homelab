import hl_helpers as helpers

helpers.generate_docker_env(["vaultwarden_admin_token", "aws_access_key_id", "smtp_password"], __file__)
