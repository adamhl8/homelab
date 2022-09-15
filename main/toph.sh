#!/bin/bash

steps=3

storage=${modules}/storage
docker=${modules}/docker

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  source ${common}/common.sh
  source ${common}/ssh.sh
  source ${common}/git_aliases.sh
  source ${common}/sops.sh
  cp ${modules}/bin/* ~/bin/

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       toph|" /etc/hosts
  mkdir ~/apps/

  echo "Copy over ssh keys: scp ~/.ssh/id_ed25519* adam@adamhl.dev:~/.ssh/"
}

step2() {
  source ${storage}/storage.sh
  source ${storage}/mergerfs.sh
  source ${storage}/snapraid.sh
  source ${storage}/snapper.sh
  source ${storage}/snapraid-btrfs.sh
  source ${storage}/snapraid-btrfs-runner.sh
  source ${storage}/ksmbd.sh
  source ${storage}/restic.sh

  source ${storage}/msmtp.sh

  source ${common}/docker.sh
}

step3() {
  source ${modules}/caddyfile.sh
  source ${modules}/ez.sh
  sops exec-env ~/homelab/secrets.env "${modules}/caddy-security.sh"
  source ${modules}/caddy.sh

  for f in ${docker}/*; do source ${f}; done

  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p /etc/sysctl.conf
  source ${common}/tailscale.sh
  docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
}