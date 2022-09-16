#!/bin/bash

mkdir ~/bin/
ln -s ~/homelab/common/bin/* ~/bin/

~/bin/system-update

sudo apt install git curl htop zip unzip -y

cd /usr/bin/
curl https://getmic.ro/r | sudo sh
cd ~/

ln -s ~/homelab/common/.bash_aliases ~/
ln -s ~/homelab/secrets.env ~/