#!/bin/bash

sudo -v

os_name=$(cat /etc/os-release | grep ^ID= | sed "s|^ID=||")
if [ "$os_name" = "debian" ]; then
  echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /' | sudo tee /etc/apt/sources.list.d/shells:fish:release:3.list
  curl -fsSL https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/shells_fish_release_3.gpg > /dev/null
elif [ "$os_name" = "ubuntu" ]; then
  sudo apt-add-repository ppa:fish-shell/release-3
else
  echo "Could not match OS: $os_name"
  exit
fi

sudo apt update
sudo apt install fish -y

fish_path=$(type -p fish)
if ! grep -q fish /etc/shells; then
  echo $fish_path | sudo tee -a /etc/shells > /dev/null
  echo "Added $fish_path to /etc/shells"
fi

chsh -s $fish_path
echo "Set $fish_path as default shell"
