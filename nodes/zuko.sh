#!/bin/bash

steps=2

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  source ~/homelab/common/common.sh
  source ~/homelab/common/ssh.sh
  source ~/homelab/common/sshd.sh

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       zuko|" /etc/hosts

  # Argon fan script
  curl https://download.argon40.com/argon1.sh | bash
  
  source ~/homelab/common/docker.sh
}

step2() {
  ln -s ${modules}/docker/ ~/
  ln -s ~/homelab/common/docker/tailscale/ ~/docker/

  for d in ~/docker/*/; do
    cd ${d}
    [[ -x "${d}/init.sh" ]] && source ${d}/init.sh
    docker compose up -d
    [[ -x "${d}/fini.sh" ]] && source ${d}/fini.sh
  done
  cd ~/

  docker exec tailscale tailscale up --accept-dns=false
}
