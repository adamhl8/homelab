from hl_helpers import homelab_paths as paths
from shellrunner import X

from nodes._macbook._modules import macbook
from shared._modules import shared


def step1() -> None:
    shared.fish_install()


def step2() -> None:
    shared.fish_setup()
    shared.common()
    X(f"ln -f -s {paths.nodes.macbook}/bin/* ~/bin/")
    X(f"ln -f -s {paths.nodes.macbook}/.gitconfig-swf ~/.gitconfig-swf")

    X("mkdir -p ~/Library/KeyBindings/")
    X(f"ln -f -s {paths.nodes.macbook}/DefaultKeyBinding.dict ~/Library/KeyBindings/DefaultKeyBinding.dict")

    X("mkdir -p ~/dev/")


def step3() -> None:
    macbook.apps()
    X(f"ln -f -s {paths.configs.wezterm_config} ~/.wezterm.lua")
    shared.sops()
    shared.ssh()
    shared.node()
    shared.sdkman()
    X("fisher install reitzig/sdkman-for-fish")


def step4() -> None:
    shared.docker.login()
