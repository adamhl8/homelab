shared="${shared:?}"

echo 'deb http://deb.debian.org/debian/ unstable main' | sudo tee /etc/apt/sources.list

# shellcheck source=./shared/pyenv_install_linux.bash
source "${shared}/pyenv_install_linux.bash"
# shellcheck source=./shared/shellrunner_install.bash
source "${shared}/shellrunner_install.bash"
