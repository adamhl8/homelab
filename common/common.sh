#!/bin/bash

${bin}/system-update

sudo apt install git htop zip unzip -y

echo "alias l='LC_COLLATE=C ls -ahlF'" | tee -a ~/.bash_aliases

mkdir ~/bin/
cp ${bin}/system-update ~/bin/
cp ${bin}/x ~/bin/