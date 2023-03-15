from shellrunner import X

from run import HOMELAB_ROOT, MODULES
from utils import helpers


def step1():
    import common.fish_install


def step2():
    import common.fish_setup

    X("echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list")
    import common.common

    X(f"ln -s {MODULES}/bin/* ~/bin/")
    # sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       sid|" /etc/hosts


def step3():
    import common.age
    import common.docker
    import common.node
    import common.sops
    import common.ssh
    import common.sshd


def step4():
    helpers.setup_pnpm()

    import nodes.sid.snapraid.init
    import nodes.sid.storage.init


def step5():
    pass


def step6():
    X(
        f"""sops -d --extract "['github_ghcr_token']" {HOMELAB_ROOT}/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )
