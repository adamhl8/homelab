#!/usr/bin/env fish

curl -Lo ~/age.tar.gz "https://dl.filippo.io/age/latest?for=linux/$(get_arch)"
tar -vxzf ~/age.tar.gz
mv ~/age/age* ~/bin/
chmod 755 ~/bin/age*
rm ~/age.tar.gz
rm -rf ~/age/
