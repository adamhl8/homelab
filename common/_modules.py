from typing import NamedTuple

from common import docker
from common.age import main as age
from common.fish_install import main as fish_install
from common.fish_setup import main as fish_setup
from common.node import main as node
from common.pdm import main as pdm
from common.shared import main as shared
from common.sops import main as sops
from common.ssh import main as ssh
from common.sshd import main as sshd


class Docker:
    def __call__(self):
        docker.main()

    def __init__(self):
        self.login = docker.login


class CommonModules(NamedTuple):
    age = age
    docker = Docker()
    fish_install = fish_install
    fish_setup = fish_setup
    node = node
    pdm = pdm
    shared = shared
    sops = sops
    ssh = ssh
    sshd = sshd


common = CommonModules()
