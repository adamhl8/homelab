```sh
mkdir -p ~/.config/fish/conf.d/
ln -f -s {fish_config_path} ~/.config/fish/
brew install fish
$HOMEBREW_PREFIX/bin/brew shellenv fish > ~/.config/fish/conf.d/homebrew.fish

fish_path="$HOMEBREW_PREFIX/bin/fish"
grep -q fish /etc/shells || echo ${fish_path} | sudo tee -a /etc/shells > /dev/null

chsh -s {fish_path}
```

fisher:

```sh
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher

fisher install daleeidd/natural-selection
fisher install PatrickF1/fzf.fish
```

Set hostname on macOS:

```sh
sudo scutil --set HostName hostname
sudo scutil --set LocalHostName hostname
```

eza install:

```sh
curl -fsSL 'https://raw.githubusercontent.com/eza-community/eza/main/deb.asc' | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list > /dev/null
sudo apt update
sudo apt install eza -y
```

batcat:

```sh
if type batcat
ln -s -f /usr/bin/batcat ~/bin/bat
```
