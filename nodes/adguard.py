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
    shared.age()
    shared.sops()
    shared.ssh()
    shared.sshd()


def step4():
    X(
        f"curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{helpers.get_arch()}.tar.gz",
    )
    X(["cd ~/", "tar -vxzf ~/adguard.tar.gz"])
    X("rm ~/adguard.tar.gz")
    X(f"ln -s {paths.nodes.adguard}/AdGuardHome.yaml ~/AdGuardHome/")

    X("sudo mkdir -p /etc/systemd/resolved.conf.d/")
    X(f"sudo ln -s {paths.nodes.adguard}/adguardhome.conf /etc/systemd/resolved.conf.d/")
    X("sudo ln -s -f /run/systemd/resolve/resolv.conf /etc/resolv.conf")
    X("sudo systemctl reload-or-restart systemd-resolved")

    X("sudo ~/AdGuardHome/AdGuardHome -s install")
