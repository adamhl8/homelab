#!/bin/bash

steps=3

step1() {
  source ${common}/common.sh
  cp ${modules}/bin/* ~/bin/

  mkdir ~/apps/

  source ${common}/docker.sh

  sudo sed -i "s|Prompt=.*|Prompt=normal|" /etc/update-manager/release-upgrades
}

step2() {
  sudo do-release-upgrade
}

step3() {
  source ${common}/ssh.sh

  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save

  echo "Add Ingress Rule."
  continue_prompt

  source ${common}/tailscale.sh
  docker exec tailscale tailscale up

  source ${modules}/caddyfile.sh
  source ${modules}/caddy.sh
}