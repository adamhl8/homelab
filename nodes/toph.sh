#!/bin/bash

step2() {
  ln -s ${modules}/msmtp/ ~/
  source ~/msmtp/init.sh

  ln -s ${modules}/ksmbd/ ~/
  source ~/ksmbd/init.sh
}

step3() {
  ln -s ${modules}/docker/ ~/
  ln -s ~/homelab/common/docker/tailscale/ ~/docker/

  for d in ~/docker/*/; do
    cd ${d}
    [[ -x "${d}/init.sh" ]] && source ${d}/init.sh
    sdc
    [[ -x "${d}/fini.sh" ]] && source ${d}/fini.sh
  done
  cd ~/

  # tailscale
  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p /etc/sysctl.conf
  docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
}
