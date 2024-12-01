from typing import NamedTuple

from shared import common, docker, fish_install, fish_setup, node, sdkman, sops, ssh, sshd, sudoers


class Common:
    def __call__(self) -> None:
        common.main()


class Docker:
    def __call__(self) -> None:
        docker.main()

    def __init__(self) -> None:
        self.login = docker.login


class FishInstall:
    def __call__(self) -> None:
        fish_install.main()


class FishSetup:
    def __call__(self) -> None:
        fish_setup.main()


class Node:
    def __call__(self) -> None:
        node.main()


class Sdkman:
    def __call__(self) -> None:
        sdkman.main()


class Sops:
    def __call__(self) -> None:
        sops.main()


class Ssh:
    def __call__(self) -> None:
        ssh.main()


class Sshd:
    def __call__(self) -> None:
        sshd.main()


class Sudoers:
    def __call__(self) -> None:
        sudoers.main()


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
    sudoers = Sudoers()


shared = SharedModules()
