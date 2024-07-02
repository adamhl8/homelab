from hl_helpers import add_apt_source, start_all_docker_containers
from hl_helpers import homelab_paths as paths
from shellrunner import ShellCommandError, X

from shared._modules import shared


def step1() -> None:
    X("mkdir -p ~/.config/fish/conf.d/")
    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")

    add_apt_source(
        name="fish",
        gpg_url="https://download.opensuse.org/repositories/shells:fish:release:3/Debian_12/Release.key",
        source="http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_12/ /",
    )

    X("sudo apt update && sudo apt install fish -y")
    fish_path = X("which fish").out
    try:
        X("grep -q fish /etc/shells")
    except ShellCommandError:
        X(f"echo {fish_path} | sudo tee -a /etc/shells >/dev/null")
        print(f"Added {fish_path} to /etc/shells")

    X(f"chsh -s {fish_path}")
    print(f"Set {fish_path} as default shell")


def step2() -> None:
    shared.fish_setup()
    shared.sudoers()
    shared.common()


def step3() -> None:
    shared.sops()
    shared.ssh()
    shared.sshd()
    shared.docker()


def step4() -> None:
    shared.docker.login()


def step5() -> None:
    X(f"ln -f -s {paths.nodes.sid}/docker/ ~/")
    start_all_docker_containers()
