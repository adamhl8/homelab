from shellrunner import X

from run import HOMELAB_ROOT, NODE
from utils import helpers
from utils.modules import common


def step1():
    common.fish_install()

    X(f"sudo ls -s {NODE}/wsl.conf /etc/")


def step2():
    common.fish_setup()
    common.shared()

    X("ln -s /mnt/c/Users/Adam/ ~/")
    X(f"ln -s {NODE}/bin/* ~/bin/")
    X("mkdir ~/dev/")


def step3():
    common.age()
    common.sops()
    common.ssh()
    common.pdm()
    common.node()


def step4():
    helpers.setup_pnpm()

    common.docker()


def step5():
    X(
        f"""sops -d --extract "['github_ghcr_token']" {HOMELAB_ROOT}/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )
