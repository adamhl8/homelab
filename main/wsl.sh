#!/bin/bash

steps=2

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

  curl -Lo ~/awscli.zip https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip
  unzip ~/awscli.zip
  rm ~/awscli.zip
  sudo ~/aws/install
  rm -rf ~/aws/

  echo "URL: https://nw-computing.awsapps.com/start#/"
  echo "Region: us-west-2"
  aws configure sso --profile nw-computing
  echo "export AWS_SDK_LOAD_CONFIG=1" | tee -a ~/.bashrc
  echo "export AWS_PROFILE=nw-computing" | tee -a ~/.bashrc
  echo "export DATADOG_API_KEY=" | tee -a ~/.bashrc

  curl -s "https://get.sdkman.io" | bash
  source ~/.sdkman/bin/sdkman-init.sh
  sdk install java 18.0.2.1-open

  source ~/bin/nvm-update
  source ~/bin/node-update

  npm install -g pnpm

  source ~/homelab/common/docker.sh
  sops exec-env ~/secrets.env 'echo $github_ghcr_token | docker login ghcr.io -u adamhl8 --password-stdin'
}
