#!/bin/bash

mkdir ~/bin/
ln -s ~/homelab/common/bin/* ~/bin/

ln -s ~/homelab/common/.bash_aliases ~/

sudo apt install software-properties-common --no-install-recommends -y
sudo add-apt-repository ppa:git-core/ppa -y
~/bin/system-update
sudo apt install git curl htop zip unzip -y

git config --global user.name 'Adam Langbert'
git config --global user.email 'adamhl@pm.me'
git config --global pull.ff only

cd ~/homelab/
git remote set-url origin git@github.com:$(git remote get-url origin | sed 's|https://github.com/||')
cd ~/

sudo -v
cd /usr/bin/
curl https://getmic.ro/r | sudo sh
cd ~/
