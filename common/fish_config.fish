# variables
set -g fish_greeting
set -gx PNPM_HOME ~/.local/share/pnpm

# PATH
set -l paths ~/bin/ ~/.local/bin/ $PNPM_HOME
for path in $paths
  if not contains $path $fish_user_paths
    set -Ua fish_user_paths $path
  end
end

# aliases
function l --wraps='LC_COLLATE=C ls -ahlF' --description 'alias l LC_COLLATE=C ls -ahlF'
  LC_COLLATE=C ls -ahlF $argv
end

# abbreviations
abbr --add gs 'git status'
abbr --add gl 'git log'
abbr --add --set-cursor gc 'git add -A && git commit -m "%"'
abbr --add gpush 'git push'
abbr --add gpull 'git pull --rebase'
abbr --add gclone 'git clone'
abbr --add gcheck 'git checkout'
abbr --add greset 'git fetch && git reset --hard @{u}'
abbr --add gclean 'git clean -ndffx'
abbr --add gcleanf 'git clean -dffx'
abbr --add gswitch 'git switch -c'
