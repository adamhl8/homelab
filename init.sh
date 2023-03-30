#!/bin/bash

homelab_root="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

# install sudo for pve
[ "$(id -u)" -eq 0 ] && apt install sudo -y

if [ "$(id -u)" -eq 0 ] && [ "${HOSTNAME}" != "pve" ]; then
  read -p "Running as root. Enter a name for the new non-root user: " username
  user_home="/home/${username}"

  apt install sudo -y

  adduser "${username}"
  usermod -aG sudo "${username}"

  mkdir -p "${user_home}/.ssh/"
  chmod 700 "${user_home}/.ssh/"
  chown "${username}:${username}" "${user_home}/.ssh/"
  cp -f "${homelab_root}/shared/configs/authorized_keys" "${user_home}/.ssh/"
  chmod 600 "${user_home}/.ssh/authorized_keys"
  chown "${username}:${username}" "${user_home}/.ssh/authorized_keys"

  cp -a "${homelab_root}/" "${user_home}/"
  chown -R "${username}:${username}" "${user_home}/homelab"
  rm -rf "${homelab_root}/"

  echo "Login as the new user and run init.sh again."
  exit
fi

[ "${HOSTNAME}" = "sid" ] && echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list
sudo apt update && sudo apt upgrade -y
sudo apt install curl -y
sudo apt install python3 python3-pip python3-venv python-is-python3 -y
if [ "${HOSTNAME}" = "sid" ]; then pip install --break-system-packages -U python-shellrunner
else pip install -U python-shellrunner
fi

pth_file="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" > /dev/null
echo "Added homelab/lib/ to python search path."
