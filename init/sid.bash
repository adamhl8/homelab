shared="${shared:?}"

sid_source='deb http://deb.debian.org/debian/ unstable main'
if ! grep -q "${sid_source}" '/etc/apt/sources.list'; then
  echo "${sid_source}" | sudo tee /etc/apt/sources.list
  sudo apt update && sudo apt full-upgrade -y
  echo "Updated system. System should be rebooted."
  return 0
fi

# shellcheck source=./shared/homebrew_install.bash
source "${shared}/homebrew_install.bash"
# shellcheck source=./shared/pyenv_install.bash
source "${shared}/pyenv_install.bash"
# shellcheck source=./shared/shellrunner_install.bash
source "${shared}/shellrunner_install.bash"
