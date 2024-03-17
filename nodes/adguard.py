from hl_helpers import get_arch
from hl_helpers import homelab_paths as paths
from shellrunner import X

from shared._modules import shared


def step1() -> None:
    shared.fish_install()


def step2() -> None:
    shared.fish_setup()
    shared.common()


def step3() -> None:
    shared.sops()
    shared.ssh()
    shared.sshd()


def step4() -> None:
    X(
        f"curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{get_arch()}.tar.gz",
    )
    X(["cd ~/", "tar -vxzf ~/adguard.tar.gz"])
    X("rm ~/adguard.tar.gz")
    X(f"ln -f -s {paths.nodes.adguard}/AdGuardHome.yaml ~/AdGuardHome/")

    X("sudo systemctl disable systemd-resolved.service")
    X("sudo service systemd-resolved stop")

    X("sudo ~/AdGuardHome/AdGuardHome -s install")
