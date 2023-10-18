from hl_helpers import homelab_paths as paths
from shellrunner import X

from nodes._macbook._modules import macbook
from shared._modules import shared


def step1():
    shared.fish_install()


def step2():
    shared.fish_setup()
    shared.common()
    X(f"ln -f -s {paths.nodes.macbook}/bin/* ~/bin/")
    X("mkdir -p ~/dev/")

    X(
        "curl -Lo ~/JetBrainsMono.zip 'https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip'",
    )
    X("unzip -o -q ~/JetBrainsMono.zip -d ~/JetBrainsMono")
    X("cp ~/JetBrainsMono/JetBrainsMonoNerdFont-* ~/Library/Fonts/")
    X("rm -rf ~/JetBrainsMono*")

    X(
        "curl -Lo ~/AtkinsonHyperlegible.zip 'https://brailleinstitute.org/wp-content/uploads/atkinson-hyperlegible-font/Atkinson-Hyperlegible-Font-Print-and-Web-2020-0514.zip'",
    )
    X("unzip -o -q ~/AtkinsonHyperlegible.zip -d ~/AtkinsonHyperlegible")
    X("cp ~/AtkinsonHyperlegible/**/Atkinson-Hyperlegible-*.ttf ~/Library/Fonts/")
    X("rm -rf ~/AtkinsonHyperlegible*")


def step3():
    macbook.apps()
    X(f"ln -f -s {paths.configs.wezterm_config} ~/.wezterm.lua")
    shared.sops()
    shared.ssh()
    shared.node()
    shared.sdkman()


def step4():
    shared.node.setup_pnpm()
    X("pnpm add -g pyright")
    shared.docker.login()
