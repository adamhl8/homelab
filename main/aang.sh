#!/bin/bash

steps=1

step1() {
  source ${common}/common.sh
  source ${common}/git_aliases.sh
  cp ${common}/bin/* ~/bin/

  mkdir ~/dev/

  echo "Copy .ssh and .gnupg to ~/"
  continue_prompt

  # ssh
  chmod 700 ~/.ssh/
  chmod 600 ~/.ssh/id_ed25519
  chmod 644 ~/.ssh/id_ed25519.pub

  # gpg
  git config --global commit.gpgsign true
  git config --global user.signingkey D9BC93089CB37ACA
  echo 'export GPG_TTY=$(tty)' | tee -a ~/.bashrc
  chmod 700 ~/.gnupg/
  chmod 644 ~/.gnupg/gpg-agent.conf
  chmod 700 ~/.gnupg/openpgp-revocs.d/
  chmod 600 ~/.gnupg/openpgp-revocs.d/*
  chmod 700 ~/.gnupg/private-keys-v1.d/
  chmod 600 ~/.gnupg/private-keys-v1.d/*
  chmod 644 ~/.gnupg/pubring.kbx
  chmod 600 ~/.gnupg/trustdb.gpg
  gpgconf --reload gpg-agent

  git config --global user.name 'Adam Langbert'
  git config --global user.email 'adamhl@pm.me'
  git config --global pull.ff only

  source ${common}/bin/nvm-update
  source ${common}/bin/node-update

  source ${common}/docker.sh
}