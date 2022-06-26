#!/bin/bash

steps=2

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  source ${common}/common.sh
  source ${common}/ssh.sh

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       zuko|" /etc/hosts
  mkdir ~/apps/

  # Argon fan script
  curl https://download.argon40.com/argon1.sh | bash
  
  source ${common}/docker.sh
}

step2() {
  source ${modules}/adguard_home.sh
  source ${modules}/uptime_kuma.sh

  source ${common}/tailscale.sh
  docker exec tailscale tailscale up
}