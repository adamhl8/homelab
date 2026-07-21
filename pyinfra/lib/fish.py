from lib.operations.converge import converge

_CONF = '"$HOME/.config/fish/conf.d/homebrew.fish"'
_PLUGINS = '"$HOME/.config/fish/fish_plugins"'


def fish_setup() -> None:
    """Generate the brew shellenv conf, make fish the login shell, sync fisher plugins.

    Requires fish installed (Brewfile) and fish_plugins deployed (shared_dotfiles), so call
    it after brew_bundle and put_files.
    """
    converge(
        check=f"brew shellenv fish 2>/dev/null | cmp -s - {_CONF}",
        fix=f'mkdir -p "$HOME/.config/fish/conf.d" && brew shellenv fish > {_CONF}',
        noop="homebrew.fish is current",
        name="Write homebrew.fish shellenv",
    )
    # /etc/shells is only the chsh allowlist, the actual login shell lives in the user
    # database (dscl on macOS, getent on Linux)
    converge(
        check=(
            'fish_path="$(command -v fish)"; '
            'current="$(dscl . -read "/Users/$USER" UserShell 2>/dev/null | awk \'{print $2}\')"; '
            '[ -n "$current" ] || current="$(getent passwd "$USER" | cut -d: -f7)"; '
            'grep -qx "$fish_path" /etc/shells && [ "$current" = "$fish_path" ]'
        ),
        fix=(
            'fish_path="$(command -v fish)"; '
            'grep -qx "$fish_path" /etc/shells || echo "$fish_path" >> /etc/shells; '
            'chsh -s "$fish_path" "$SUDO_USER"'
        ),
        noop="fish is the login shell",
        name="Make fish the login shell",
        _sudo=True,
        # keep the user's PATH so the root shell can resolve fish, root's PATH has no homebrew
        _preserve_sudo_env=True,
    )
    # fisher update installs missing plugins and removes unlisted ones, so fish_plugins
    # is the single source of truth
    converge(
        check=(
            "[ \"$(fish -c 'fisher list' 2>/dev/null | sort)\" = "
            f'"$(sort {_PLUGINS} 2>/dev/null)" ]'
        ),
        fix=(
            'fish -c "curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish'
            ' | source && fisher update"'
        ),
        noop="fisher plugins are synced",
        name="Sync fisher plugins",
    )
