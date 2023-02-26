#!/usr/bin/env fish

function step1
  source $common/fish_setup.fish
  sudo cp $modules/wsl.conf /etc/
end

function step2
  source $common/common.fish
  ln -s /mnt/c/Users/Adam/ ~/
  ln -s $modules/bin/* ~/bin/
  mkdir ~/dev/
end

function step3
  source $common/age.fish
  source $common/sops.fish
  source $common/ssh.fish
  source $common/node.fish
  pnpm config set enable-pre-post-scripts=true
  pnpm add -g npm-check-updates
  pnpm login
  
  source $common/docker.fish
end

function step4
  sops -d --extract "['github_ghcr_token']" $HOMELAB_ROOT/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin
end
