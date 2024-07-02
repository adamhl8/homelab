shared="${shared:?}"

# shellcheck source=./shared/rye.bash
source "${shared}/rye.bash"
echo 'export PATH="$HOME/.rye/shims:$PATH"' >> ~/.bashrc
# shellcheck source=./shared/shellrunner.bash
source "${shared}/shellrunner.bash"
