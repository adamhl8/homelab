set -q GHOSTTY_RESOURCES_DIR; and source "$GHOSTTY_RESOURCES_DIR"/shell-integration/fish/vendor_conf.d/ghostty-shell-integration.fish

starship init fish | source

# PATH

function clean_path --description 'Cleans PATH (removes duplicates and empty paths). $argv will be appended to PATH'
    set -l ORIGINAL_PATH $PATH
    set -e PATH
    set -gx --path PATH
    fish_add_path -P -a $ORIGINAL_PATH
    fish_add_path -P -a -m $argv
end

function add_path --description 'Prepends $argv to PATH'
    fish_add_path -P -p -m $argv
end

set -l base_bin_paths /usr/local/bin /usr/bin /bin /usr/local/sbin /usr/sbin /sbin
clean_path $base_bin_paths

# this will be used with add_path so that the paths are added in the right order
# e.g. we want ~/bin to be first
set -l extra_paths ~/bin ~/.local/bin
set -a extra_paths ~/.bun/bin
if type -q go
    set -a extra_paths (go env GOPATH)/bin
    set -a extra_paths (go env GOROOT)/bin
end
set -a extra_paths ~/.cargo/bin
set -a extra_paths ~/.zig
set -a extra_paths (path filter -d $HOMEBREW_PREFIX/opt/*/libexec/gnubin; or true)
set -a extra_paths $HOMEBREW_PREFIX/opt/curl/bin
set -a extra_paths $HOMEBREW_PREFIX/opt/zip/bin
set -a extra_paths $HOMEBREW_PREFIX/opt/unzip/bin
set -a extra_paths $HOMEBREW_PREFIX/opt/llvm/bin

set -a extra_paths $HOMEBREW_PREFIX/opt/flex/bin
set -a extra_paths $HOMEBREW_PREFIX/opt/bison/bin
set -gx LDFLAGS "-L/opt/homebrew/opt/flex/lib -L/opt/homebrew/opt/bison/lib -L/opt/homebrew/opt/llvm/lib"
set -gx CPPFLAGS "-I/opt/homebrew/opt/flex/include -I/opt/homebrew/opt/llvm/include"

add_path $extra_paths

# variables
set -g fish_greeting
set -gx UID (id -u)
set -gx GID (id -g)

type -q micro; and set -gx EDITOR micro
type -q sops; and set -gx SOPS_AGE_KEY_FILE ~/.config/sops/age/keys.txt
type -q fzf_configure_bindings; and set -gx fzf_fd_opts -u

type -q sops; and set -gx OPENAI_API_KEY (sops -d --extract "['openai_api_key']" ~/secrets.yaml)

type -q sops; and set -gx RADARR_URL 'https://radarr.adamhl.dev'
type -q sops; and set -gx RADARR_API_KEY (sops -d --extract "['radarr_api_key']" ~/secrets.yaml)
type -q sops; and set -gx SONARR_URL 'https://sonarr.adamhl.dev'
type -q sops; and set -gx SONARR_API_KEY (sops -d --extract "['sonarr_api_key']" ~/secrets.yaml)

if test $hostname = adam-macbook
    type -q sops; and set -gx VULCAN_TOKEN (sops -d --extract "['swf_vulcan_pat']" ~/secrets.yaml)
    type -q sops; and set -gx CI_JOB_TOKEN $VULCAN_TOKEN
    type -q sops; and set -gx GITHUB_TOKEN (sops -d --extract "['github_repo_token']" ~/secrets.yaml)
end

type -q fnm; and fnm env --shell fish | source

# functions/aliases
function l --wraps='eza -laaghM --classify=always --icons=always --git --git-repos' --description 'alias eza -laaghM --classify=always --icons=always --git --git-repos'
    eza -laaghM --classify=always --icons=always --git --git-repos $argv
end

function ls_on_cd --on-variable PWD
    l
end

function cat --wraps='bat' --description 'alias cat bat'
    bat $argv
end

function gbc --description 'git branch cleanup'
    git fetch -p && git branch -vv | grep ': gone]' | grep -v "\*" | awk '{print $1}' | xargs -r git branch -D
end

# abbreviations
abbr -a gs 'git status'
abbr -a gl 'git log --graph --format=\'%Cred%h%Creset%C(auto)%d%Creset %s %Cgreen(%ch)%Creset %C(bold blue)%an%Creset %Cblue<%ae>%Creset\''
abbr -a --set-cursor gc "git add -A && git commit -m '%'"
abbr -a gca "git add -A && git commit --amend --no-edit"

function _git_commit_relative
    set -l git_root (git rev-parse --show-toplevel 2>/dev/null; or true)
    set -l relative_path (string replace -r "^$git_root/" "" (pwd))
    echo "git add -A && git commit -m '$relative_path: %'"
end
abbr -a --set-cursor gcr --function _git_commit_relative

abbr -a gpush 'git push'
abbr -a gpull 'git pull --rebase'
abbr -a gclone 'git clone'
abbr -a gcheck 'git checkout'
abbr -a greset 'git fetch && git reset --hard @{u}'
abbr -a gprune 'git fetch -fpP && gbc && git gc --aggressive --prune=now'
abbr -a gclean 'git clean -ndffx'
abbr -a gcleanf 'git clean -dffx'
abbr -a gsanitize 'git clean -dffx && git fetch -fpP && gbc && git reset --hard @{u} && git reflog expire --expire=now --all && git gc --aggressive --prune=now'
abbr -a gswitch 'git switch -c'

abbr -a dcu 'docker compose up -d'
abbr -a dcd 'docker compose down'

abbr -a pfmt 'prettier --config ~/.prettierrc.mjs --write .'

abbr -a tazea 'bunx taze latest -lfw && rm -rf node_modules/ bun.lock && bun i -f'

abbr -a --set-cursor q 'sgpt -s \'%\''

# binds
if functions --query _natural_selection
    bind escape '_natural_selection end-selection'
    bind up '_natural_selection up-or-search'
    bind down '_natural_selection down-or-search'
    bind left '_natural_selection backward-char'
    bind right '_natural_selection forward-char'
    bind delete '_natural_selection delete-char'
    bind backspace '_natural_selection backward-delete-char'
    bind shift-left '_natural_selection backward-char --is-selecting'
    bind shift-right '_natural_selection forward-char --is-selecting'
    bind alt-left '_natural_selection backward-word'
    bind alt-right '_natural_selection forward-word'
    bind alt-shift-left '_natural_selection backward-word --is-selecting'
    bind alt-shift-right '_natural_selection forward-word --is-selecting'
    bind alt-backspace '_natural_selection backward-kill-word'
    bind alt-delete '_natural_selection kill-word'
    bind super-left '_natural_selection beginning-of-line'
    bind super-right '_natural_selection end-of-line'
    bind super-shift-left '_natural_selection beginning-of-line --is-selecting'
    bind super-shift-right '_natural_selection end-of-line --is-selecting'
    bind super-delete '_natural_selection kill-line'
    bind super-backspace '_natural_selection backward-kill-line'
    bind super-a '_natural_selection select-all'
    bind super-z '_natural_selection undo'
    bind super-shift-z '_natural_selection redo'
    # bind super-/ wip # For micro
    bind '' kill-selection end-selection self-insert
end
