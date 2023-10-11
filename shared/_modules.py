from typing import NamedTuple

from shared import common, docker, fish_install, fish_setup, node, rye, sdkman, sops, ssh, sshd


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
    common = Common()
    docker = Docker()
    fish_install = FishInstall()
    fish_setup = FishSetup()
    node = Node()
    sdkman = Sdkman()
    sops = Sops()
    ssh = Ssh()
    sshd = Sshd()


shared = SharedModules()
