#!/bin/bash

step1() {

source ${common}/update_system.sh
sudo sed -i "s|Prompt=.*|Prompt=normal|" /etc/update-manager/release-upgrades

reboot_prompt
}

step2() {

sudo do-release-upgrade
}

step3() {

source ${common}/common.sh
source ${common}/add_ssh_key.sh
source ${common}/ssh_perms.sh

sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

echo "Add Ingress Rule"
continue_prompt

# Tailscale
source ${common}/tailscale.sh
sudo tailscale up

# Caddy
source ${common}/caddy.sh

tee ~/caddy/Caddyfile << EOF
ezaks.freemyip.com {
  reverse_proxy 100.67.147.105:8100
}
EOF
~/caddy/caddy fmt -overwrite ~/caddy/Caddyfile

source ${common}/caddy_service.sh
}