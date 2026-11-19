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

# Install what tsinfra needs, plus `lefthook` for the `bask prepare` that `bun install` runs.
echo "Installing bun, sops, age, lefthook..."
brew install oven-sh/bun/bun sops age lefthook
bun install

if [ ! -f "$AGE_KEY" ]; then
  echo "Decrypting age key..."
  mkdir -p "$(dirname "$AGE_KEY")"
  until age -o "$AGE_KEY" -d secrets/key.age; do
    echo "Failed to decrypt, try again"
  done
  chmod 600 "$AGE_KEY"
fi

# Print the apply command instead of running it, so the apply stays a step of its own.
# Have it load `brew shellenv` because this script can't change the PATH of the shell that ran it.
echo "Bootstrap done. Run this to apply the macbook host:"
# shellcheck disable=SC2016 # Print the command literally, for the user's shell to expand.
echo '  cd ~/homelab && eval "$(/opt/homebrew/bin/brew shellenv)" && bunx bask apply macbook'
