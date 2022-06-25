#!/bin/bash

steps=3

storage=${modules}/storage
docker=${modules}/docker

step1() {
  echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
  source ${common}/common.sh
  source ${common}/ssh.sh
  cp ${modules}/bin/* ~/bin/

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       toph|" /etc/hosts
  mkdir ~/apps/

  echo "Copy over ssh keys: scp ~/.ssh/id_ed25519* adam@adamhl.dev:~/.ssh/"
  echo "Copy over secrets"
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
  source ${common}/caddy.sh

  source ${docker}/discord-app-bot.sh
  source ${docker}/reaction-light.sh
  source ${docker}/plex.sh
  source ${docker}/unifi-controller.sh
  source ${docker}/cupsd.sh
  source ${docker}/vaultwarden.sh
  source ${docker}/syncthing.sh
  source ${docker}/filebrowser.sh
  source ${docker}/n8n.sh
  source ${docker}/dashdot.sh
  source ${docker}/sonarr.sh
  source ${docker}/radarr.sh
  source ${docker}/qbittorrent.sh
  source ${docker}/homeassistant.sh
  source ${docker}/scrutiny.sh
  source ${docker}/homarr.sh
  source ${docker}/zigbee2mqtt.sh

  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p /etc/sysctl.conf
  source ${common}/tailscale.sh
  docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
}