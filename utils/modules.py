from collections.abc import Callable
from typing import NamedTuple

import common.age
import common.docker
import common.fish_install
import common.fish_setup
import common.node
import common.pdm
import common.shared
import common.sops
import common.ssh
import common.sshd

ModuleFunction = Callable[..., None]


class Modules(NamedTuple):
    age: ModuleFunction = common.age.main
    docker: ModuleFunction = common.docker.main
    fish_install: ModuleFunction = common.fish_install.main
    fish_setup: ModuleFunction = common.fish_setup.main
    node: ModuleFunction = common.node.main
    pdm: ModuleFunction = common.pdm.main
    shared: ModuleFunction = common.shared.main
    sops: ModuleFunction = common.sops.main
    ssh: ModuleFunction = common.ssh.main
    sshd: ModuleFunction = common.sshd.main


common = Modules()
