#!/bin/bash

read -p "GitHub public_repo Token: " public_repo_token
curl -s https://api.github.com/repos/ironicbadger/docker-snapraid/actions/artifacts | grep -o -E "https://(.*)artifacts(.*)zip" | sed 1q | xargs curl -H "Authorization: token ${public_repo_token}" -Lo ~/snapraid.zip
unzip ~/snapraid.zip
rm ~/snapraid.zip
sudo apt install ~/snapraid-from-source.deb -y
rm ~/snapraid-from-source.deb
sudo apt-mark hold snapraid
snapraid --version

mkdir ~/snapraid/
tee ~/snapraid/snapraid.conf << EOF
data d1 /mnt/disk1
data d2 /mnt/disk2
data d3 /mnt/disk3

parity /mnt/parity1/snapraid.parity

content /home/adam/snapraid/snapraid.content
content /mnt/parity1/snapraid.content

exclude *.unrecoverable
exclude /.snapshots/
exclude /lost+found/
exclude /tmp/
EOF