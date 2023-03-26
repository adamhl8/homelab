def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")
    X("curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher")
    X("fisher install IlanCosman/tide@v5")
    X("echo 2 1 4 3 1 1 1 1 1 1 y | tide configure >/dev/null")
