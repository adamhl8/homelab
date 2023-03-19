from shellrunner import X

from run import HOMELAB_ROOT, NODE
from utils import helpers
from utils.modules import common


def step1():
    common.fish_install()


def step2():
    common.fish_setup()

    X("echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list")
    common.shared()

    X(f"ln -s {NODE}/bin/* ~/bin/")
    # sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       sid|" /etc/hosts


def step3():
    common.age()
    common.docker()
    common.node()
    common.sops()
    common.ssh()
    common.sshd()


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
