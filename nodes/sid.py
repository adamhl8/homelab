from hl_helpers import homelab_paths as paths
from hl_helpers import start_all_docker_containers
from shellrunner import X

from nodes._sid._modules import sid
from shared._modules import shared


def step1() -> None:
    shared.fish_install()


def step2() -> None:
    shared.fish_setup()
    shared.sudoers()
    shared.common()

    X("mkdir -p ~/logs/")
    X(f"ln -f -s {paths.nodes.sid}/bin/* ~/bin/")


def step3() -> None:
    shared.sops()
    shared.ssh()
    shared.sshd()
    shared.node()
    shared.docker()


def step4() -> None:
    shared.docker.login()

    sid.disks()
    sid.snapraid()
    sid.restic()
    sid.smb()
    sid.nas()


def step5() -> None:
    X(f"ln -f -s {paths.nodes.sid}/docker/ ~/")
    start_all_docker_containers()
