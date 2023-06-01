/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

if [ -e "/home/linuxbrew/.linuxbrew/bin/brew" ]; then
  sudo apt install build-essential
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
  brew install gcc
elif [ -e "/opt/homebrew/bin/brew" ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
else
  echo "Failed to match brew binary."
  return 0
fi

brew install python@3.11
