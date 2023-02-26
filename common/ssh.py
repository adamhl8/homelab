from X import X
from run import HOMELAB_ROOT, COMMON
import utils.helpers as helpers

X('mkdir ~/.ssh/')
X('chmod 700 ~/.ssh/')
X(f'ln -s {COMMON}/authorized_keys ~/.ssh/')

X(f"""sops -d --extract "['ssh']['$hostname']['pri']" {HOMELAB_ROOT}/secrets.yaml >~/.ssh/id_ed25519""")
X(f"""sops -d --extract "['ssh']['$hostname']['pub']" {HOMELAB_ROOT}/secrets.yaml >~/.ssh/id_ed25519.pub""")
X('chmod 600 ~/.ssh/id_ed25519')
X('chmod 644 ~/.ssh/id_ed25519.pub')

X('git config --global commit.gpgsign true')
X('git config --global gpg.format ssh')
X('git config --global user.signingkey "~/.ssh/id_ed25519.pub"')
