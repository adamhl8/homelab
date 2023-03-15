from shellrunner import X

from run import COMMON

X(f"ln -f -s {COMMON}/fish_config.fish ~/.config/fish/config.fish")
X("curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher")
X("fisher install IlanCosman/tide@v5")
X("echo 2 1 4 3 1 1 1 1 1 1 y | tide configure >/dev/null")
