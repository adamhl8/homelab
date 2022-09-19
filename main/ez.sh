#!/bin/bash

steps=4

step1() {
  echo "Change password for ubuntu user in another shell: sudo -i; passwd ubuntu"
  continue_prompt

  ~/homelab/common/common.sh
  rm ~/.ssh/authorized_keys
  ~/homelab/common/ssh.sh
  
  sudo sed -i "s|Prompt=.*|Prompt=normal|" /etc/update-manager/release-upgrades
}

step2() {
  sudo do-release-upgrade
}

step3() {
  ~/homelab/common/sshd.sh

  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save

  echo "Add Ingress Rule."
  continue_prompt

  ~/homelab/common/docker.sh
}

step4() {
  ln -s ${modules}/docker/ ~/
  ln -s ~/homelab/common/docker/tailscale/ ~/docker/

  for d in ~/docker/*/; do
    cd ${d}
    ${d}/init.sh
    sdc
    ${d}/fini.sh
  done
  cd ~/
}
