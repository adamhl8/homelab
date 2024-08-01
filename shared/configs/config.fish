# variables
set -l paths ~/bin ~/.local/bin /usr/local/sbin /usr/sbin /sbin
set -g fish_greeting
set -gx UID (id -u)
set -gx GID (id -g)

set -a paths $HOME/.rye/shims

type -q micro; and set -gx EDITOR micro
type -q sops; and set -gx SOPS_AGE_KEY_FILE ~/.config/sops/age/keys.txt

if type -q nvm
    nvm -s use latest
    set -gx nvm_default_packages pnpm yarn
end

if test -e ~/.bun/bin/bun
    set -gx BUN_INSTALL ~/.bun
    set -a paths $BUN_INSTALL/bin
end

if type -q pnpm
    set -gx PNPM_HOME ~/.local/share/pnpm
    set -a paths $PNPM_HOME
end

set -a paths (path filter -d $HOMEBREW_PREFIX/opt/*/libexec/gnubin; or true)

if test $hostname = adam-macbook
    type -q sops; and set -gx CI_JOB_TOKEN (sops -d --extract "['swf_vulcan_pat']" ~/secrets.yaml)
    type -q sops; and set -gx VULCAN_PAT (sops -d --extract "['swf_vulcan_pat']" ~/secrets.yaml)
    set -a paths $HOMEBREW_PREFIX/opt/curl/bin
    set -a paths $HOMEBREW_PREFIX/opt/zip/bin
    set -a paths $HOMEBREW_PREFIX/opt/unzip/bin
end

# PATH
set -l new_paths
for path in $paths
    if not contains $path $PATH
        set -a new_paths $path
    end
end
set -p PATH $new_paths

set -l ind (contains -i -- kubectl $tide_right_prompt_items); and set -e tide_right_prompt_items[$ind]

type -q zoxide; and zoxide init fish --cmd cd | source
set -gx fzf_fd_opts -u

# aliases
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
abbr -a gl 'git log'
abbr -a --set-cursor gc 'git add -A && git commit -m "%"'
abbr -a gpush 'git push'
abbr -a gpull 'git pull --rebase'
abbr -a gclone 'git clone'
abbr -a gcheck 'git checkout'
abbr -a greset 'git fetch && git reset --hard @{u}'
abbr -a gprune 'git fetch -fpP && gbc && git gc --aggressive --prune=now'
abbr -a gclean 'git clean -ndffx'
abbr -a gcleanf 'git clean -dffx'
abbr -a gsanitize 'git clean -dffx && git fetch -fpP && gbc && git reset --hard @{u} && git gc --aggressive --prune=now'
abbr -a gswitch 'git switch -c'

abbr -a dcu 'docker compose up -d'
abbr -a dcd 'docker compose down'

abbr -a pfmt 'prettier --config ~/.prettierrc.mjs --write .'

abbr -a --set-cursor q 'sgpt -s \'%\''

# binds
set --local escape \e
set --local control_r \cR
set --local up \e'[A'
set --local down \e'[B'
set --local left \e'[D'
set --local right \e'[C'
set --local backspace \x7F
set --local delete \e'[3~'
set --local shift_left \e'[1;2D'
set --local shift_right \e'[1;2C'
set --local option_left \e'[1;3D'
set --local option_right \e'[1;3C'
set --local option_shift_left \e'[1;4D'
set --local option_shift_right \e'[1;4C'
set --local option_backspace \e\x7F
set --local option_delete \e'[3;3~'

# Terminal needs to send these sequences
set --local command_left \e'[1;9D'
set --local command_right \e'[1;9C'
set --local command_shift_left \e'[1;10D'
set --local command_shift_right \e'[1;10C'
set --local command_backspace \e'[127;9u'
set --local command_delete \e'[3;9~'
set --local command_a \e'[97;9u'
set --local command_z \e'[122;9u'
set --local command_shift_z \e'[122;10u'
set --local command_slash \e'[47;9u' # For micro

if functions --query _natural_selection
    bind $escape '_natural_selection end-selection'
    # bind $control_r           '_natural_selection history-pager'
    bind $up '_natural_selection up-or-search'
    bind $down '_natural_selection down-or-search'
    bind $left '_natural_selection backward-char'
    bind $right '_natural_selection forward-char'
    bind $delete '_natural_selection delete-char'
    bind $backspace '_natural_selection backward-delete-char'
    bind $shift_left '_natural_selection backward-char --is-selecting'
    bind $shift_right '_natural_selection forward-char --is-selecting'
    bind $option_left '_natural_selection backward-word'
    bind $option_right '_natural_selection forward-word'
    bind $option_shift_left '_natural_selection backward-word --is-selecting'
    bind $option_shift_right '_natural_selection forward-word --is-selecting'
    bind $option_backspace '_natural_selection backward-kill-word'
    bind $option_delete '_natural_selection kill-word'
    bind $command_left '_natural_selection beginning-of-line'
    bind $command_right '_natural_selection end-of-line'
    bind $command_shift_left '_natural_selection beginning-of-line --is-selecting'
    bind $command_shift_right '_natural_selection end-of-line --is-selecting'
    bind $command_delete '_natural_selection kill-line'
    bind $command_backspace '_natural_selection backward-kill-line'
    bind $command_a '_natural_selection select-all'
    bind $command_z '_natural_selection undo'
    bind $command_shift_z '_natural_selection redo'
    bind '' kill-selection end-selection self-insert
end
