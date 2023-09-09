import hl_helpers as helpers
from shellrunner import X

helpers.generate_docker_env(["discord_app_bot_token"], __file__)
X("mkdir ~/docker/discord-app-bot/data/")
