#!/bin/bash

steps=1

step1() {
  source ${common}/update_system.sh
  source ${common}/common.sh
  source ${modules}/git_aliases.sh
  source ${modules}/git_scripts.sh

  ln -s /mnt/c/Users/Adam/ ~/
  mkdir ~/dev/

  # ssh
  cp -r /mnt/c/Users/Adam/Desktop/.ssh/ ~/
  chmod 700 ~/.ssh/
  chmod 600 ~/.ssh/id_ed25519
  chmod 644 ~/.ssh/id_ed25519.pub

  # gpg
  git config --global commit.gpgsign true
  git config --global user.signingkey D9BC93089CB37ACA
  echo 'export GPG_TTY=$(tty)' | tee -a ~/.bashrc
  cp -r /mnt/c/Users/Adam/Desktop/.gnupg/ ~/
  chmod 700 ~/.gnupg/
  chmod 644 ~/.gnupg/gpg-agent.conf
  chmod 700 ~/.gnupg/openpgp-revocs.d/
  chmod 600 ~/.gnupg/openpgp-revocs.d/*
  chmod 700 ~/.gnupg/private-keys-v1.d/
  chmod 600 ~/.gnupg/private-keys-v1.d/*
  chmod 644 ~/.gnupg/pubring.kbx
  chmod 600 ~/.gnupg/trustdb.gpg
  gpgconf --reload gpg-agent

  sudo apt install git -y
  git config --global user.name 'Adam Langbert'
  git config --global user.email 'adamhl@pm.me'
  git config --global pull.ff only

  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  nvm install node
  nvm install-latest-npm
}