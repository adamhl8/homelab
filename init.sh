#!/bin/bash

homelab_root="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [ "$(id -u)" -eq 0 ]; then
  read -p "Running as root. Enter a name for the new non-root user: " username
  user_home="/home/${username}"

  apt install sudo -y

  adduser "${username}"
  usermod -aG sudo "${username}"

  mkdir -p "${user_home}/.ssh/"
  chmod 700 "${user_home}/.ssh/"
  chown "${username}:${username}" "${user_home}/.ssh/"
  cp -f "${homelab_root}/common/configs/authorized_keys" "${user_home}/.ssh/"
  chmod 600 "${user_home}/.ssh/authorized_keys"
  chown "${username}:${username}" "${user_home}/.ssh/authorized_keys"

  cp -a "${homelab_root}/" "${user_home}/"
  chown -R "${username}:${username}" "${user_home}/homelab"

  echo "Login as the new user and run init.sh again."
  exit
fi

sudo apt update
sudo apt install curl -y
sudo apt install python3 python3-pip python3-venv python-is-python3 -y
pip install -U python-shellrunner

pth_file="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" > /dev/null
echo "Added homelab/lib/ to python search path."
