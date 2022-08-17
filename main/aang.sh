#!/bin/bash

# https://wiki.debian.org/KDE#Installation
# https://community.frame.work/t/debian-11-on-the-framework-laptop/10395/4
# https://wiki.debian.org/PipeWire#Debian_Testing.2FUnstable

steps=4

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main contrib non-free' | sudo tee /etc/apt/sources.list
  source ${common}/common.sh
  source ${common}/git_aliases.sh
  cp ${common}/bin/* ~/bin/

  mkdir ~/dev/

  sudo apt install kde-standard

  echo "Re-enable WiFi/BT."
}

step2() {
  sudo apt update && sudo apt install firmware-iwlwifi firmware-misc-nonfree
}

step3() {
  sudo apt install wireplumber pipewire-media-session-
  systemctl --user --now enable wireplumber.service

  sudo apt install pipewire-audio-client-libraries
  sudo cp /usr/share/doc/pipewire/examples/alsa.conf.d/99-pipewire-default.conf /etc/alsa/conf.d/

  sudo apt install libspa-0.2-jack
  sudo cp /usr/share/doc/pipewire/examples/ld.so.conf.d/pipewire-jack-*.conf /etc/ld.so.conf.d/

  sudo apt install libspa-0.2-bluetooth pulseaudio-module-bluetooth-
}

step4() {
  sudo apt install fprintd libpam-fprintd
  fprintd-enroll -f right-index-finger
  # sudo pam-auth-update

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

  curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
  curl -fsSL https://pkgs.tailscale.com/stable/debian/sid.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
  sudo apt update && sudo apt install tailscale
  sudo tailscale up

  source ${common}/docker.sh
}