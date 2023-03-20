from typing import NamedTuple

from shellrunner import X

from nodes.sid.restic.init import main as restic
from nodes.sid.snapraid.init import main as snapraid
from nodes.sid.storage.init import main as storage
from utils import helpers
from utils.modules import ModuleFunction, common


class Sid(NamedTuple):
    storage: ModuleFunction = storage
    snapraid: ModuleFunction = snapraid
    restic: ModuleFunction = restic


sid = Sid()


def step1():
    common.fish_install()


def step2():
    common.fish_setup()

    X("echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list")
    common.shared()


def step3():
    common.age()
    common.sops()
    common.ssh()
    common.sshd()
    common.node()
    common.docker()


def step4():
    helpers.setup_pnpm()

    sid.storage()
    sid.snapraid()
    sid.restic()


def step5():
    pass


def step6():
    helpers.docker_login()
