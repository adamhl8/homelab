# variables
set -g fish_greeting
set -gx EDITOR micro
set -gx PYENV_ROOT ~/.pyenv
set -gx SOPS_AGE_KEY_FILE ~/.config/sops/age/keys.txt
set -gx CI_JOB_TOKEN (sops -d --extract "['swf_gitlab_pat']" ~/secrets.yaml)

# PATH
set -gp paths ~/bin ~/.local/bin $PYENV_ROOT/bin
for path in $paths
  if not contains $path $PATH
    set -p PATH $path
  end
end

type -q pyenv; and pyenv init - | source

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
