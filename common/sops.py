from X import X
from run import HOMELAB_ROOT
import utils.helpers as helpers

X(f'curl -s https://api.github.com/repos/mozilla/sops/releases/latest | string match -r "https://.*sops.*linux.{helpers.get_arch()}" | sed 1q | xargs curl -Lo ~/bin/sops')
X('chmod 755 ~/bin/sops')
X(f'ln -s {HOMELAB_ROOT}/secrets.yaml ~/')

X('mkdir -p ~/.config/sops/age/')
print('Enter key.age passphrase')
X(f'age -o ~/.config/sops/age/keys.txt -d {HOMELAB_ROOT}/key.age')
X('chmod 600 ~/.config/sops/age/keys.txt')