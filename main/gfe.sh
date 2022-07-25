#!/bin/bash

steps=1

step1() {
  # autoload -Uz zsh-newuser-install
  # zsh-newuser-install -f
  
  echo "PROMPT='%(?.%F{green}√.%F{red}?%?)%f %B%F{240}%1~%f%b %# '" | tee -a ~/.zshrc

  mkdir ~/bin/
  cp ${modules}/bin/* ~/bin/

  cd ~/bin/
  curl https://getmic.ro/r | bash
  cd ~/

  echo "path+=('/Users/a2272858/bin/')" | tee -a ~/.zshrc

  echo "alias l='LC_COLLATE=C ls -ahlF'" | tee -a ~/.zshrc
  source ${modules}/git_aliases.sh

  mkdir ~/dev/

  echo "Copy .ssh to home directory."
  continue_prompt

  # ssh
  chmod 700 ~/.ssh/
  chmod 600 ~/.ssh/id_ed25519
  chmod 644 ~/.ssh/id_ed25519.pub

  git config --global user.name 'Adam Langbert'
  git config --global user.email 'adamhl@pm.me'
  git config --global pull.ff only

  source ${modules}/bin/nvm-update
  source ${modules}/bin/node-update

  curl -Lo ~/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-osx-amd64
}