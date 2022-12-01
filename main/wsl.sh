#!/bin/bash

steps=4

step1() {
  sudo cp ${modules}/wsl.conf /etc/
  echo "Restart WSL (wsl --shutdown)"
}

step2() {
  ln -s /mnt/c/Users/Adam/ ~/

  source ~/homelab/common/common.sh
  source ~/homelab/common/ssh.sh
  source ~/homelab/common/sops.sh
  ln -s ${modules}/bin/* ~/bin/

  mkdir ~/dev/

  curl -s "https://get.sdkman.io" | bash
  source ~/.sdkman/bin/sdkman-init.sh
  sdk install java 18.0.2.1-open

  source ~/bin/nvm-update
  source ~/bin/node-update

  npm install -g pnpm
  pnpm setup
}

step3() {
  pnpm config set enable-pre-post-scripts=true
  pnpm add -g npm-check-updates
  pnpm login
  
  source ~/homelab/common/docker.sh
  echo "Restart WSL (wsl --shutdown)"
}

step4() {
  sops exec-env ~/secrets.env 'echo $github_ghcr_token | docker login ghcr.io -u adamhl8 --password-stdin'
}
