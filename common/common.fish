#!/usr/bin/env fish

ln -s $common/bin/ ~/

source ~/bin/system-update
sudo apt install git curl htop zip unzip -y

git config --global user.name 'Adam Langbert'
git config --global user.email 'adamhl@pm.me'
git config --global pull.ff only

cd $HOMELAB_ROOT
git remote set-url origin git@github.com:(git remote get-url origin | string replace 'https://github.com/' '')
cd ~/

sudo -v
cd /usr/bin/
curl https://getmic.ro/r | sudo sh
cd ~/

curl -Lo ~/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_(get_arch)
chmod 755 ~/bin/yq
