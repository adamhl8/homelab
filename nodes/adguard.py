from X import X
from run import MODULES
import utils.helpers as helpers

def step1():
  helpers.add_user()

def step2():
  X('sudo rm -rf /root/homelab/')
  import common.fish_install

def step3():
  import common.fish_setup
  X("echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list")
  import common.common

def step4():
  import common.age
  import common.sops
  import common.ssh
  import common.sshd

def step5():
  X(f'curl -Lo ~/adguard.tar.gz https://github.com/AdguardTeam/AdGuardHome/releases/latest/download/AdGuardHome_linux_{helpers.get_arch()}.tar.gz')
  X('cd ~/; tar -vxzf ~/adguard.tar.gz')
  X('rm ~/adguard.tar.gz')
  X(f'ln -s {MODULES}/AdGuardHome.yaml ~/AdGuardHome/')
  X('sudo ~/AdGuardHome/AdGuardHome -s install')
