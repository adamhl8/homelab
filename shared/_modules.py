from typing import NamedTuple

from shared import age, common, docker, fish_install, fish_setup, node, pdm, sdkman, sops, ssh, sshd


class Age:
    def __call__(self):
        age.main()


class Common:
    def __call__(self):
        common.main()


class Docker:
    def __call__(self):
        docker.main()

    def __init__(self):
        self.login = docker.login


class FishInstall:
    def __call__(self):
        fish_install.main()


class FishSetup:
    def __call__(self):
        fish_setup.main()


class Node:
    def __call__(self):
        node.main()

    def __init__(self):
        self.setup_pnpm = node.setup_pnpm


class Pdm:
    def __call__(self):
        pdm.main()


class Sdkman:
    def __call__(self):
        sdkman.main()


class Sops:
    def __call__(self):
        sops.main()


class Ssh:
    def __call__(self):
        ssh.main()


class Sshd:
    def __call__(self):
        sshd.main()


class SharedModules(NamedTuple):
    age = Age()
    common = Common()
    docker = Docker()
    fish_install = FishInstall()
    fish_setup = FishSetup()
    node = Node()
    pdm = Pdm()
    sdkman = Sdkman()
    sops = Sops()
    ssh = Ssh()
    sshd = Sshd()


shared = SharedModules()
