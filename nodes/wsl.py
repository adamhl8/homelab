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
    shared.age()
    shared.sops()
    shared.ssh()
    shared.pdm()
    shared.node()
    shared.sdkman()
    shared.docker()


def step4():
    shared.node.setup_pnpm()
    X("pnpm add -g pyright")
    shared.docker.login()
