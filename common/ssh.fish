#!/usr/bin/env fish

mkdir ~/.ssh/
chmod 700 ~/.ssh/
ln -s $HOMELAB_ROOT/common/authorized_keys ~/.ssh/

sops -d --extract "['ssh']['$hostname']['pri']" $HOMELAB_ROOT/secrets.yaml >~/.ssh/id_ed25519
sops -d --extract "['ssh']['$hostname']['pub']" $HOMELAB_ROOT/secrets.yaml >~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey "~/.ssh/id_ed25519.pub"
