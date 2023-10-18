RYE_INSTALL_OPTION="--yes" /bin/bash -c "$(curl -fsSL https://rye-up.com/get)"
export PATH="$HOME/.rye/shims:$PATH"
rye config --set-bool behavior.global-python=true
rye config --set default.toolchain=3.12
rye toolchain fetch 3.12
