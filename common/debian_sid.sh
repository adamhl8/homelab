#!/bin/bash

echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list

sudo apt install vim -y
sudo apt install curl -y