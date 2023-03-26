import hl_helpers as helpers
from shellrunner import X

helpers.generate_docker_env(["eyir_token"], __file__)

X("mkdir ~/dev/")
X(["cd ~/dev/", "git clone git@github.com:adamhl8/eyir.git"])
X("mkdir ~/docker/eyir/data/")
X("touch ~/docker/eyir/data/filebrowser.db")
