from X import X
from run import HOMELAB_ROOT, MODULES

def step1():
  import common.fish_install
  X(f'sudo cp {MODULES}/wsl.conf /etc/')

def step2():
  import common.fish_setup
  import common.common
  X('ln -s /mnt/c/Users/Adam/ ~/')
  X(f'ln -s {MODULES}/bin/* ~/bin/')
  X('mkdir ~/dev/')

def step3():
  import common.age
  import common.sops
  import common.ssh
  import common.node

def step4();
  X('pnpm config set enable-pre-post-scripts=true')
  X('pnpm add -g npm-check-updates')
  X('pnpm login')

  import common.docker

def step5():
  X(f'''sops -d --extract "['github_ghcr_token']" {HOMELAB_ROOT}/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin''')
