shared="${shared:?}"

xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
eval "$(/opt/homebrew/bin/brew shellenv)"

brew install openssl readline sqlite3 xz zlib tcl-tk
brew install pyenv
# shellcheck source=./shared/shellrunner_install.bash
source "${shared}/shellrunner_install.bash"
