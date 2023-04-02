#!/bin/bash

if ! (return 0 2>/dev/null); then
  echo "This script must be sourced."
  exit 1
fi

set -euo pipefail
IFS=$'\n\t'

homelab_root="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
init="${homelab_root}/init"
shared="${init}/shared"

[ "${HOSTNAME}" = "adguard" ] && source "${init}/adguard.sh"
[ "${HOSTNAME}" = "pve" ] && source "${init}/pve.sh"
[ "${HOSTNAME}" = "sid" ] && source "${init}/sid.sh"
[ "${HOSTNAME}" = "wsl" ] && source "${init}/wsl.sh"

sudo apt update && sudo apt upgrade -y
sudo apt install curl -y
sudo apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y
curl https://pyenv.run | bash
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv > /dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
pyenv install 3.10
pyenv global 3.10
pip install --upgrade pip
pip install -U python-shellrunner

pth_file="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" > /dev/null
echo "Added homelab/lib/ to python search path."
