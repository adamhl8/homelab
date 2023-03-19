from collections.abc import Callable
from typing import NamedTuple

from common.age import main as age
from common.docker import main as docker
from common.fish_install import main as fish_install
from common.fish_setup import main as fish_setup
from common.node import main as node
from common.pdm import main as pdm
from common.shared import main as shared
from common.sops import main as sops
from common.ssh import main as ssh
from common.sshd import main as sshd

ModuleFunction = Callable[..., None]


class Modules(NamedTuple):
    age: ModuleFunction = age
    docker: ModuleFunction = docker
    fish_install: ModuleFunction = fish_install
    fish_setup: ModuleFunction = fish_setup
    node: ModuleFunction = node
    pdm: ModuleFunction = pdm
    shared: ModuleFunction = shared
    sops: ModuleFunction = sops
    ssh: ModuleFunction = ssh
    sshd: ModuleFunction = sshd


common = Modules()
