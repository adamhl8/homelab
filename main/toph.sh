#!/bin/bash

steps=3

storage=${modules}/storage
docker=${modules}/docker

step1() {
  source ${common}/debian_sid.sh
  source ${common}/update_system.sh
  source ${common}/common.sh
  source ${common}/add_ssh_key.sh
  source ${common}/ssh_perms.sh

  sudo sed -i "s|127\.0\.1\.1.*|127.0.1.1       toph|" /etc/hosts
  mkdir ~/apps/

  echo "Copy over ssh keys: scp ~/.ssh/id_ed25519* adam@adamhl.dev:~/.ssh/"
  echo "Copy over backup.zip and unzip: tar -vxzf backup.tar.gz"
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

  source ${modules}/backup.sh
  source ${common}/docker.sh
}

step3() {
  source ${common}/caddy.sh
  source ${modules}/caddyfiles.sh
  source ${common}/caddy_service.sh

  # Set user
  read -p "Waiting for caddy to start..." -t 5
  echo
  sed -i 's|"username":.*|"username": "adam",|' ~/caddy/users.json
  sed -i 's|"address":.*|"address": "adamhl@pm.me",|' ~/caddy/users.json
  sed -i 's|"domain":.*|"domain": "pm.me"|' ~/caddy/users.json
  sed -i 's|"hash":.*|"hash": "$2a$10$VDEPmf84mFZsfh4GF1tIuOFlmu8bWhMlhCYNmZbdhDYDNLID/1PtS",|' ~/caddy/users.json

  sudo systemctl restart caddy

  source ${docker}/ddns-route53.sh
  source ${docker}/discord-app-bot.sh
  source ${docker}/reaction-light.sh
  source ${docker}/plex.sh
  source ${docker}/vaultwarden.sh
  source ${docker}/syncthing.sh
  source ${docker}/filebrowser.sh
  source ${docker}/n8n.sh
  source ${docker}/ward.sh
  source ${docker}/xbackbone.sh
  source ${docker}/wg-access-server.sh
  source ${docker}/webtop.sh
  source ${docker}/searxng.sh
  source ${docker}/sonarr.sh
  source ${docker}/radarr.sh
  source ${docker}/qbittorrent.sh
  source ${docker}/minecraft.sh

  source ${common}/tailscale.sh
  echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
  echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p /etc/sysctl.conf

  sudo tailscale up --advertise-exit-node --advertise-routes=192.168.0.0/24,192.168.1.0/24
}