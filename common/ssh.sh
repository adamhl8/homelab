#!/bin/bash

mkdir ~/.ssh/
chmod 700 ~/.ssh/
ln -s ~/homelab/common/authorized_keys ~/.ssh/

echo "Copy over ssh keys."
continue_prompt

hostname=$(hostname)
mv ~/.ssh/${hostname} ~/.ssh/id_ed25519
mv ~/.ssh/${hostname}.pub ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

git config --global commit.gpgsign true
git config --global gpg.format ssh
git config --global user.signingkey "~/.ssh/id_ed25519.pub"
