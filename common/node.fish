#!/usr/bin/env fish

fisher install jorgebucaran/nvm.fish

set -U nvm_default_version latest
set -U nvm_default_packages pnpm
mkdir $PNPM_HOME

nvm install latest
npm install -g npm
