from shellrunner import X

from lib import hl_helpers
from run import NODE
from utils.modules import common


def step1():
    common.fish_install()


def step2():
    common.fish_setup()
    common.shared()


def step3():
    common.age()
    common.sops()
    common.ssh()
    common.sshd()


def step4():
    X(
        f"curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{hl_helpers.get_arch()}.tar.gz",
    )
    X(["cd ~/", "tar -vxzf ~/adguard.tar.gz"])
    X("rm ~/adguard.tar.gz")
    X(f"ln -s {NODE}/AdGuardHome.yaml ~/AdGuardHome/")
    X("sudo ~/AdGuardHome/AdGuardHome -s install")
