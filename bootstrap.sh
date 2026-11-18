#!/bin/sh
set -eu

REPO_HTTPS="https://github.com/adamhl8/homelab.git"
REPO_DIR="$HOME/homelab"
AGE_KEY="$HOME/.config/sops/age/keys.txt"

if ! command -v brew >/dev/null 2>&1; then
  echo "Installing homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

BREW="/opt/homebrew/bin/brew"
eval "$("$BREW" shellenv)"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Cloning homelab into $REPO_DIR..."
  git clone "$REPO_HTTPS" "$REPO_DIR"
fi
cd "$REPO_DIR"

# install what's needed for tsinfra
echo "Installing bun, sops, age..."
brew install oven-sh/bun/bun sops age
bun install

if [ ! -f "$AGE_KEY" ]; then
  echo "Decrypting age key..."
  mkdir -p "$(dirname "$AGE_KEY")"
  until age -o "$AGE_KEY" -d secrets/key.age; do
    echo "Failed to decrypt, try again"
  done
  chmod 600 "$AGE_KEY"
fi

echo "Bootstrap done, run: bunx tsinfra apply macbook"
