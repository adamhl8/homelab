apt install sudo -y

{
  echo 'export PYENV_ROOT="$HOME/.pyenv"'
  echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"'
} >>~/.bashrc
echo 'eval "$(pyenv init -)"' >>~/.bashrc
