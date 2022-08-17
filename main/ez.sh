#!/bin/bash

steps=4

step1() {
  source ${common}/common.sh
  mkdir ~/apps/
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

  source ${common}/docker.sh
}

step4() {
  source ${common}/tailscale.sh
  docker exec tailscale tailscale up

  source ${modules}/caddyfile.sh
  source ${modules}/caddy.sh
}