#!/usr/bin/env fish

rm -rf ~/.android
rm -rf ~/.cache
rm -rf ~/.cups
rm -rf ~/.gradle
rm -rf ~/.hawtjni
rm -rf ~/.lesshst
rm -rf ~/.matplotlib
rm -rf ~/.m2
rm -rf ~/.node_repl_history
rm -rf ~/.npm
rm -rf ~/.pnpm-state
rm -rf ~/.python_history
rm -rf ~/.sonarlint
rm -rf ~/.sts4
rm -rf ~/.yarn
rm -rf ~/.yarnrc
rm -rf ~/Movies
rm -rf ~/Music
rm -rf ~/.bash_history
rm -rf ~/.zsh_history

fd -ui -tf '^\.DS_Store' ~ -x rm -f
fd -ui -tf '^\.localized' ~ -x rm -f
fd -ui -tf '^\._' ~ -x rm -f
