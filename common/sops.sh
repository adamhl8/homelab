#!/bin/bash

curl -s https://api.github.com/repos/mozilla/sops/releases/latest | grep -o -E "https://(.*)sops(.*)linux.amd64" | sed 1q | xargs curl -Lo ~/bin/sops
chmod 755 ~/bin/sops

mkdir -p ~/.config/sops/age/
echo "Copy age keys file to ~/.config/sops/age/"
continue_prompt
