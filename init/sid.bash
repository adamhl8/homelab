shared="${shared:?}"

sid_source='deb http://deb.debian.org/debian/ unstable main'
if ! grep -q "${sid_source}" '/etc/apt/sources.list'; then
  echo "${sid_source}" | sudo tee /etc/apt/sources.list
  sudo apt update && sudo apt full-upgrade -y
  echo "Updated system. System should be rebooted."
  return 0
fi

# shellcheck source=./shared/homebrew.bash
source "${shared}/homebrew.bash"
# shellcheck source=./shared/rye.bash
source "${shared}/rye.bash"
# shellcheck source=./shared/shellrunner.bash
source "${shared}/shellrunner.bash"
