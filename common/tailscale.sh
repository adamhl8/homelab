#!/bin/bash

os_name=$(cat /etc/os-release | grep ^ID= | sed "s|^ID=||")
release=$(lsb_release -cs)

curl -fsSL https://pkgs.tailscale.com/stable/${os_name}/${release}.noarmor.gpg | sudo gpg --dearmor -o /usr/share/keyrings/tailscale-archive-keyring.gpg
curl -fsSL https://pkgs.tailscale.com/stable/${os_name}/${release}.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt update
sudo apt install tailscale