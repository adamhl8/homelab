#!/bin/bash

steps=3

step1() {
  source ${common}/debian_sid.sh
  source ${common}/common.sh
  source ${common}/ssh.sh
  cp ${bin}/docker-container-update ~/bin/

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       zuko|" /etc/hosts
  mkdir ~/apps/

  # Argon fan script
  curl https://download.argon40.com/argon1.sh | bash
}

step2() {
  source ${modules}/adguard_home.sh
  source ${common}/docker.sh
}

step3() {
  source ${modules}/uptime_kuma.sh
}