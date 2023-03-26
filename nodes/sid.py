import hl_helpers as helpers
from shellrunner import X

from nodes.sid._modules import sid
from shared._modules import shared

paths = helpers.homelab_paths


def step1():
    shared.fish_install()


def step2():
    shared.fish_setup()

    X("echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list")
    shared.common()

    X(f"ln -s {paths.nodes.sid}/bin/* ~/bin/")


def step3():
    shared.age()
    shared.sops()
    shared.ssh()
    shared.sshd()
    shared.node()
    shared.docker()


def step4():
    shared.docker.login()
    shared.node.setup_pnpm()

    sid.storage()
    sid.snapraid()
    sid.restic()
    sid.ksmbd()


def step5():
    X(f"ln -s {paths.nodes.sid}/docker/ ~/")
    helpers.start_all_docker_containers()
