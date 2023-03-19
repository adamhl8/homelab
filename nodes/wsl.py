from shellrunner import X

from run import HOMELAB_ROOT, MODULES
from utils import helpers


def step1():
    import common.fish_install

    X(f"sudo ls -s {MODULES}/wsl.conf /etc/")


def step2():
    import common.common
    import common.fish_setup

    X("ln -s /mnt/c/Users/Adam/ ~/")
    X(f"ln -s {MODULES}/bin/* ~/bin/")
    X("mkdir ~/dev/")


def step3():
    import common.age
    import common.node
    import common.pdm
    import common.sops
    import common.ssh


def step4():
    helpers.setup_pnpm()

    import common.docker


def step5():
    X(
        f"""sops -d --extract "['github_ghcr_token']" {HOMELAB_ROOT}/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )
