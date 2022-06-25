#!/bin/bash

${bin}/system-update

sudo apt install git curl htop zip unzip -y

cd /usr/bin/
curl https://getmic.ro/r | sudo sh
cd ~/

echo "alias l='LC_COLLATE=C ls -ahlF'" | tee -a ~/.bash_aliases

mkdir ~/bin/
cp ${bin}/* ~/bin/