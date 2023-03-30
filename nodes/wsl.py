from hl_helpers import homelab_paths as paths
from shellrunner import X

from shared._modules import shared


def step1():
    shared.fish_install()

    X(f"sudo ln -s {paths.nodes.wsl}/wsl.conf /etc/")


def step2():
    shared.fish_setup()
    shared.common()

    X(f"ln -s {paths.nodes.wsl}/bin/* ~/bin/")
    X("ln -s /mnt/c/Users/Adam/ ~/")
    X("mkdir ~/dev/")


def step3():
    X(
        "sudo apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev",
    )
    X("curl https://pyenv.run | bash")

    shared.age()
    shared.sops()
    shared.ssh()
    shared.pdm()
    shared.node()
    shared.docker()


def step4():
    shared.node.setup_pnpm()
    X("pnpm add -g pyright")
    shared.docker.login()
