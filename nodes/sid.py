from typing import NamedTuple

from hl_helpers import homelab_paths as paths
from shellrunner import X

from nodes.sid.restic.init import main as restic
from nodes.sid.snapraid.init import main as snapraid
from nodes.sid.storage.init import main as storage
from shared._modules import shared


class Sid(NamedTuple):
    storage = storage
    snapraid = snapraid
    restic = restic


sid = Sid()


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
    shared.node.setup_pnpm()

    sid.storage()
    sid.snapraid()
    sid.restic()


def step5():
    pass


def step6():
    shared.docker.login()
