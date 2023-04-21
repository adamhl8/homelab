from hl_helpers import homelab_paths as paths
from shellrunner import X

from nodes._macbook._modules import macbook
from shared._modules import shared


def step1():
    shared.fish_install()
    X(f"ln -s {paths.nodes.macbook}/macbook.fish ~/.config/fish/conf.d/")


def step2():
    shared.fish_setup()
    shared.common()
    X("mkdir -p ~/dev/")


def step3():
    macbook.install_apps()
    shared.age()
    shared.sops()
    shared.ssh()
    shared.pdm()
    shared.node()
    shared.sdkman()


def step4():
    shared.node.setup_pnpm()
    X("pnpm add -g pyright")
    shared.docker.login()
