#!/usr/bin/env fish

curl -s https://api.github.com/repos/mozilla/sops/releases/latest | string match -r "https://.*sops.*linux.$(get_arch)" | sed 1q | xargs curl -Lo ~/bin/sops
chmod 755 ~/bin/sops

ln -s $HOMELAB_ROOT/secrets.yaml ~/

mkdir -p ~/.config/sops/age/
echo "Enter key.age passphrase"
age -o ~/.config/sops/age/keys.txt -d $HOMELAB_ROOT/key.age
chmod 600 ~/.config/sops/age/keys.txt
