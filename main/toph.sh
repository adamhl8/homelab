#!/bin/bash

steps=3

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  ~/homelab/common/common.sh
  ~/homelab/common/ssh.sh
  ~/homelab/common/sops.sh
  ln -s ${modules}/bin/* ~/bin/

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       toph|" /etc/hosts

  echo "Copy over ssh keys: scp ~/.ssh/id_ed25519* adam@adamhl.dev:~/.ssh/"
}

step2() {
  ${modules}/storage/storage.sh

  ln -s ${modules}/snapraid/ ~/
  ~/snapraid/init.sh

  ln -s ${modules}/restic/ ~/
  ~/restic/init.sh

  ln -s ${modules}/msmtp/ ~/
  ~/msmtp/init.sh

  ln -s ${modules}/ksmbd/ ~/
  ~/ksmbd/init.sh

  ~/homelab/common/docker.sh
}

step3() {
  ln -s ${modules}/docker/ ~/
  ln -s ~/homelab/common/docker/tailscale/ ~/docker/

  for d in ~/docker/*/; do
    cd $d
    sdc
  done
  cd ~/

  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p /etc/sysctl.conf
  docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
}