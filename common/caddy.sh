#!/bin/bash

mkdir ~/caddy/
echo 'export PATH=$PATH:$HOME/caddy/' | tee -a ~/.profile

# Go
sudo rm -rf /usr/local/go/
curl -s https://go.dev/dl/ | grep -o -E "/dl/go(.*)linux-amd64.tar.gz" | sed 1q | sed "s|^|https://go.dev|" | xargs curl -Lo ~/go.tar.gz
sudo tar -vxzf ~/go.tar.gz -C /usr/local/
rm ~/go.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' | tee -a ~/.profile
source ~/.profile

# xcaddy
curl -s https://api.github.com/repos/caddyserver/xcaddy/releases/latest | grep -o -E "https://(.*)xcaddy(.*)linux_amd64.tar.gz" | sed 1q | xargs curl -Lo ~/xcaddy.tar.gz
tar -vxzf ~/xcaddy.tar.gz -C ~/caddy/
rm ~/xcaddy.tar.gz
xcaddy build --with github.com/greenpau/caddy-security --output ~/caddy/caddy
chmod 755 ~/caddy/caddy
sudo rm -rf ~/go/