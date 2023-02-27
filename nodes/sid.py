from X import X
from run import HOMELAB_ROOT, MODULES
import utils.helpers as helpers

def step1():
  import common.fish_install

def step2():
  import common.fish_setup
  X('echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list')
  import common.common
  X(f'ln -s {MODULES}/bin/* ~/bin/')
  # sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       sid|" /etc/hosts

def step3():
  import common.age
  import common.sops
  import common.ssh
  import common.sshd
  import common.node

def step4():
  helpers.setup_pnpm()

  import nodes.sid.storage.init
  import nodes.sid.snapraid.init

  import common.docker

def step5():


def step5():
  X(f'''sops -d --extract "['github_ghcr_token']" {HOMELAB_ROOT}/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin''')
