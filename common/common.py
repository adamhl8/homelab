from X import X
from run import HOMELAB_ROOT, COMMON
import utils.helpers as helpers

X(f'ln -s {COMMON}/bin/ ~/')

X('~/bin/system-update')
X('sudo apt install git curl htop zip unzip -y')

X("git config --global user.name 'Adam Langbert'")
X("git config --global user.email 'adamhl@pm.me'")
X('git config --global pull.ff only')

X(f'''
cd {HOMELAB_ROOT}
git remote set-url origin git@github.com:(git remote get-url origin | string replace 'https://github.com/' '')
''')

X('sudo -v')
X('''
cd /usr/bin/
curl https://getmic.ro/r | sudo sh
''')

X(f'curl -Lo ~/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_{helpers.get_arch()}')
X('chmod 755 ~/bin/yq')