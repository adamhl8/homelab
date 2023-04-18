set -gx PNPM_HOME ~/.local/share/pnpm
set -gx SDKMAN_DIR ~/.sdkman
set -g sdkman_prefix $SDKMAN_DIR
test -e $sdkman_prefix/bin/sdkman-init.sh; and type -q fenv; and fenv "source $sdkman_prefix/bin/sdkman-init.sh"

set -g paths $PNPM_HOME (path filter -d /opt/homebrew/opt/*/libexec/gnubin)

abbr --add pdmp 'pdm publish -u __token__ -P (sops -d --extract "[\'pypi_token\']" ~/secrets.yaml)'
