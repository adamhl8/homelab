#!/bin/bash

sudo tee /etc/apt/sources.list << EOF
deb http://deb.debian.org/debian/ unstable main
EOF

sudo apt update
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo apt install vim -y
sudo apt install curl -y