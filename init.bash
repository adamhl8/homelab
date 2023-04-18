#!/usr/bin/env bash

if ! (return 0 2>/dev/null); then
  echo "This script must be sourced."
  exit 1
fi

set -euo pipefail
IFS=$'\n\t'

homelab_root="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
init="${homelab_root}/init"
shared="${init}/shared"
hostname="${HOSTNAME:-$(hostname)}"
[ -z "${hostname}" ] && echo "Failed to resolve hostname." && return 0

# shellcheck source=./init/adguard.bash
[ "${hostname}" = "adguard" ] && source "${init}/adguard.bash"
# shellcheck source=./init/macbook.bash

[ "${hostname}" = "adam-macbook.local" ] && source "${init}/macbook.bash"

# shellcheck source=./init/pve.bash
[ "${hostname}" = "pve" ] && source "${init}/pve.bash"

# shellcheck source=./init/sid.bash
[ "${hostname}" = "sid" ] && source "${init}/sid.bash"

return 0
