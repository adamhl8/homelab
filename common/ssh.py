from shellrunner import X

from run import COMMON, HOMELAB_ROOT

X("mkdir -p ~/.ssh/")
X("chmod 700 ~/.ssh/")
X(f"ln -f -s {COMMON}/authorized_keys ~/.ssh/")

X(f"""sops -d --extract "['$hostname']['pri']" {HOMELAB_ROOT}/ssh.yaml >~/.ssh/id_ed25519""")
X(f"""sops -d --extract "['$hostname']['pub']" {HOMELAB_ROOT}/ssh.yaml >~/.ssh/id_ed25519.pub""")
X("chmod 600 ~/.ssh/id_ed25519")
X("chmod 644 ~/.ssh/id_ed25519.pub")
