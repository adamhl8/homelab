homelab_root="${homelab_root:?}"

if [ "$(id -u)" -eq 0 ]; then
  read -r -p "Running as root. Enter a name for the new non-root user: " username
  user_home="/home/${username}"

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
  rm -rf "${homelab_root:?}/"

  echo "Login as the new user and run init.sh again."
  return 0
fi
