# variables
set -l paths ~/bin ~/.local/bin
set -g fish_greeting

set -gx PYENV_ROOT ~/.pyenv
set -a paths $PYENV_ROOT/bin

type -q micro; and set -gx EDITOR micro
type -q sops; and set -gx SOPS_AGE_KEY_FILE ~/.config/sops/age/keys.txt

if type -q pnpm
  set -gx PNPM_HOME ~/.local/share/pnpm
  set -a paths $PNPM_HOME
end

if test -e ~/.sdkman/bin/sdkman-init.sh
  set -gx SDKMAN_DIR ~/.sdkman
  set -g sdkman_prefix $SDKMAN_DIR
  type -q fenv; and fenv "source $SDKMAN_DIR/bin/sdkman-init.sh"
end

set -a paths (path filter -d $HOMEBREW_PREFIX/opt/*/libexec/gnubin; or true)

if test $hostname = "adam-macbook"
  set -gx CI_JOB_TOKEN (sops -d --extract "['swf_gitlab_pat']" ~/secrets.yaml)
end

# PATH
set -l new_paths
for path in $paths
  if not contains $path $PATH
    set -a new_paths $path
  end
end
set -p PATH $new_paths

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

if type -q pdm
  abbr --add pdmp 'pdm publish -u __token__ -P (sops -d --extract "[\'pypi_token\']" ~/secrets.yaml)'
  abbr --add pdma 'eval (pdm venv activate)'
end
