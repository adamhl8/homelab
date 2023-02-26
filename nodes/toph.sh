#!/bin/bash

steps=3

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  source ~/homelab/common/common.sh
  source ~/homelab/common/ssh.sh
  source ~/homelab/common/sshd.sh
  source ~/homelab/common/sops.sh
  ln -s ${modules}/bin/* ~/bin/

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       toph|" /etc/hosts
}

step2() {
  source ${modules}/storage/storage.sh

  ln -s ${modules}/snapraid/ ~/
  source ~/snapraid/init.sh

  ln -s ${modules}/restic/ ~/
  source ~/restic/init.sh

  ln -s ${modules}/msmtp/ ~/
  source ~/msmtp/init.sh

  ln -s ${modules}/ksmbd/ ~/
  source ~/ksmbd/init.sh

  source ~/homelab/common/docker.sh
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
