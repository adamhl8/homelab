#!/bin/bash

steps=1

step1() {
  ~/homelab/common/common.sh
  ~/homelab/common/ssh.sh
  ~/homelab/common/sops.sh
  ln -s ${modules}/bin/* ~/bin/

  ln -s /mnt/c/Users/Adam/ ~/
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

  ~/bin/nvm-update
  ~/bin/node-update

  ~/homelab/common/docker.sh
}
