#!/usr/bin/env bash

if ! (return 0 2> /dev/null); then
  echo "This script must be sourced."
  exit 1
fi

set -euo pipefail
IFS=$'\n\t'

homelab_root="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [[ "$(pwd)" == "${homelab_root}"* ]]; then
  echo "Do not run this script from the homelab directory, or else the local python (venv) install will be used."
  return 0
fi

init="${homelab_root}/init"
shared="${init}/shared"
hostname="${HOSTNAME:-$(hostname)}"
[ -z "${hostname}" ] && echo "Failed to resolve hostname." && return 0

os_name="$(uname -o)"
if [ "${os_name}" = "GNU/Linux" ]; then
  os_name="linux"
elif [ "${os_name}" = "Darwin" ]; then
  os_name="macos"
else
  echo "Failed to resolve an expected OS. Got '${os_name}'"
  return 0
fi

if [ "${os_name}" = "linux" ] && type apt > /dev/null; then
  type sudo > /dev/null || apt install sudo -y
  sudo apt update && sudo apt full-upgrade -y
  sudo apt install curl -y
fi

# shellcheck source=./init/adguard.bash
[ "${hostname}" = "adguard" ] && source "${init}/adguard.bash" && return 0

# shellcheck source=./init/macbook.bash
[ "${hostname}" = "adam-macbook" ] && source "${init}/macbook.bash" && return 0

# shellcheck source=./init/pve.bash
[ "${hostname}" = "pve" ] && source "${init}/pve.bash" && return 0

# shellcheck source=./init/sid.bash
[ "${hostname}" = "sid" ] && source "${init}/sid.bash" && return 0

# shellcheck source=./init/pi.bash
[ "${hostname}" = "pi" ] && source "${init}/pi.bash" && return 0

echo "Failed to match hostname: ${hostname}"

echo "If you are on macOS, it can be set with:"
echo "sudo scutil --set HostName hostname"
echo "sudo scutil --set LocalHostName hostname"
