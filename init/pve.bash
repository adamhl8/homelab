shared="${shared:?}"

# shellcheck source=./shared/pyenv_install.bash
source "${shared}/pyenv_install.bash"
{
  echo 'export PYENV_ROOT="$HOME/.pyenv"'
  echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"'
  echo 'eval "$(pyenv init -)"'
} >>~/.bashrc

# shellcheck source=./shared/shellrunner_install.bash
source "${shared}/shellrunner_install.bash"
