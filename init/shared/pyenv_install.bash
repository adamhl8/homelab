os_name="${os_name:?}"

if [ "${os_name}" = "linux" ]; then
  sudo apt install build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev -y
  curl https://pyenv.run | bash
elif [ "${os_name}" = "macos" ]; then
  brew install openssl readline sqlite3 xz zlib tcl-tk
  brew install pyenv
else
  echo "Failed to match OS for pyenv install. Got '${os_name}'"
  return 0
fi
