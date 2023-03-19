from shellrunner import X

from run import NODE
from utils import helpers
from utils.modules import common


def step1():
    helpers.add_user()


def step2():
    X("sudo rm -rf /root/homelab/")
    common.fish_install()


def step3():
    common.fish_setup()
    common.shared()


def step4():
    common.age()
    common.sops()
    common.ssh()
    common.sshd()


def step5():
    X(
        f"curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{helpers.get_arch()}.tar.gz",
    )
    X(["cd ~/", "tar -vxzf ~/adguard.tar.gz"])
    X("rm ~/adguard.tar.gz")
    X(f"ln -s {NODE}/AdGuardHome.yaml ~/AdGuardHome/")
    X("sudo ~/AdGuardHome/AdGuardHome -s install")
