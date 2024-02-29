RYE_TOOLCHAIN_VERSION="3.12" RYE_INSTALL_OPTION="--yes" /bin/bash -c "$(curl -fsSL https://rye-up.com/get)"
export PATH="$HOME/.rye/shims:$PATH"
rye config --set-bool behavior.global-python=true
rye config --set default.toolchain=3.12
rye config --set-bool behavior.use-uv=true
rye toolchain fetch 3.12
