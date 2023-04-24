import hl_helpers as helpers
from shellrunner import X

from shared._modules import shared

paths = helpers.homelab_paths


def step1():
    shared.fish_install()


def step2():
    shared.fish_setup()
    shared.common()


def step3():
    shared.sops()
    shared.ssh()
    shared.sshd()


def step4():
    X(
        f"curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{helpers.get_arch()}.tar.gz",
    )
    X(["cd ~/", "tar -vxzf ~/adguard.tar.gz"])
    X("rm ~/adguard.tar.gz")
    X(f"ln -f -s {paths.nodes.adguard}/AdGuardHome.yaml ~/AdGuardHome/")

    X("sudo systemctl disable systemd-resolved.service")
    X("sudo service systemd-resolved stop")

    X("sudo ~/AdGuardHome/AdGuardHome -s install")
