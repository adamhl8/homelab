# variables
set -g fish_greeting
set -gx EDITOR micro
set -gx PNPM_HOME ~/.local/share/pnpm
set -gx PYENV_ROOT ~/.pyenv
# sdkman
set -gx SDKMAN_DIR ~/.sdkman
set -g sdkman_prefix $SDKMAN_DIR
test -e $sdkman_prefix/bin/sdkman-init.sh && fenv "source $sdkman_prefix/bin/sdkman-init.sh"

# PATH
set -l paths ~/bin/ ~/.local/bin/ $PNPM_HOME $PYENV_ROOT/bin
for path in $paths
  if not contains $path $fish_user_paths
    set -Ua fish_user_paths $path
  end
end

if type -q pyenv
  pyenv init - | source
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
abbr --add pdmp 'pdm publish -u __token__ -P (sops -d --extract "[\'pypi_token\']" ~/secrets.yaml)'
