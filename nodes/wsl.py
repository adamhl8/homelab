from shellrunner import X

from run import HOMELAB_ROOT, NODE
from utils import helpers
from utils.modules import common


def step1():
    common.fish_install()

    X(f"sudo ln -s {NODE}/wsl.conf /etc/")


def step2():
    common.fish_setup()
    common.shared()

    X("ln -s /mnt/c/Users/Adam/ ~/")
    X("mkdir ~/dev/")


def step3():
    common.age()
    common.sops()
    common.ssh()
    common.pdm()
    common.node()
    common.docker()


def step4():
    helpers.setup_pnpm()
    X("pnpm add -g pyright")
    helpers.docker_login()
