import platform
from X import X
from run import HOMELAB_ROOT, COMMON

def get_arch():
  arch = 'amd64'
  if platform.machine() == 'aarch64': arch = 'arm64'
  return arch

def add_user(user: str='adam'):
  user_home=f'/home/{user}'

  X('apt install sudo')

  X(f'adduser {user}')
  X(f'usermod -aG sudo {user}')

  X(f'mkdir -p {user_home}/.ssh/')
  X(f'chmod 700 {user_home}/.ssh/')
  X(f'chown {user}:{user} {user_home}/.ssh/')
  X(f'cp -f {COMMON}/authorized_keys {user_home}/.ssh/')
  X(f'chmod 600 {user_home}/.ssh/authorized_keys')
  X(f'chown {user}:{user} {user_home}/.ssh/authorized_keys')
  
  X(f'touch {HOMELAB_ROOT}/step1')
  X(f'cp -a {HOMELAB_ROOT}/ {user_home}/')
  X(f'chown -R {user}:{user} {user_home}/homelab')
  