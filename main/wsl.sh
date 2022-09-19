#!/bin/bash

steps=1

step1() {
  ~/homelab/common/common.sh
  ~/homelab/common/ssh.sh
  ~/homelab/common/sops.sh
  ln -s ${modules}/bin/* ~/bin/

  ln -s /mnt/c/Users/Adam/ ~/
  mkdir ~/dev/

  echo "export AWS_SDK_LOAD_CONFIG=1" | tee -a ~/.bashrc
  echo "export AWS_PROFILE=nw-computing" | tee -a ~/.bashrc
  echo "export DATADOG_API_KEY=" | tee -a ~/.bashrc

  source ${modules}/bin/nvm-update
  source ${modules}/bin/node-update

  source ${common}/docker.sh
}
