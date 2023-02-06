#!/usr/bin/env fish

ln -f -s $common/fish_config.fish ~/.config/fish/config.fish

curl -sL https://git.io/fisher | source && fisher install jorgebucaran/fisher

fisher install IlanCosman/tide@v5
echo 2 1 4 3 1 1 1 1 1 1 y | tide configure >/dev/null
