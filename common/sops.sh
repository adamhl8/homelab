#!/bin/bash

arch="amd64"
[[ "$(arch)" = "aarch64" ]] && arch="arm64"
curl -s https://api.github.com/repos/mozilla/sops/releases/latest | grep -o -E "https://(.*)sops(.*)linux.${arch}" | sed 1q | xargs curl -Lo ~/bin/sops
chmod 755 ~/bin/sops

ln -s ~/homelab/secrets.env ~/

mkdir -p ~/.config/sops/age/
echo "Copy age keys file to ~/.config/sops/age/"
continue_prompt
chmod 600 ~/.config/sops/age/keys.txt
