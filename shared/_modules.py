from typing import NamedTuple

from shared import docker, node
from shared.age import main as age
from shared.common import main as common
from shared.fish_install import main as fish_install
from shared.fish_setup import main as fish_setup
from shared.pdm import main as pdm
from shared.sops import main as sops
from shared.ssh import main as ssh
from shared.sshd import main as sshd


class Docker:
    def __call__(self):
        docker.main()

    def __init__(self):
        self.login = docker.login


class Node:
    def __call__(self):
        node.main()

    def __init__(self):
        self.setup_pnpm = node.setup_pnpm


class SharedModules(NamedTuple):
    age = age
    common = common
    docker = Docker()
    fish_install = fish_install
    fish_setup = fish_setup
    node = Node()
    pdm = pdm
    sops = sops
    ssh = ssh
    sshd = sshd


shared = SharedModules()
