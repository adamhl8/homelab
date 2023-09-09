#!/usr/bin/env fish

rm -rf ~/.android
rm -rf ~/.cache
rm -rf ~/.cups
rm -rf ~/.embedded-postgres-go
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

set ds_store (fd -ui -tf '^\.DS_Store$' ~)
if test -n "$ds_store"
  printf '%s\n' $ds_store
  read -n 1 -P "Delete? [Y/n] " reply
  test $reply != n -a $reply != N
  and rm -f $ds_store
end

set localized (fd -ui -tf '^\.localized$' ~)
if test -n "$localized"
  printf '%s\n' $localized
  read -n 1 -P "Delete? [Y/n] " reply
  test $reply != n -a $reply != N
  and rm -f $localized
end

set dotu (fd -ui -tf '^\._' ~)
if test -n "$dotu"
  printf '%s\n' $dotu
  read -n 1 -P "Delete? [Y/n] " reply
  test $reply != n -a $reply != N
  and rm -f $dotu
end
