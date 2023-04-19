brew install --cask alt-tab
brew install mas
mas install 1206020918 # Battery Indicator
mas install 1565701763 # AudioWranger
mas install 6446061552 # Signal Shifter
mas install 1611378436 # Pure Paste
brew install --cask tailscale
brew install --cask discord
brew install --cask docker
brew tap homebrew/cask-versions
brew install --cask firefox-developer-edition

curl -Lo /Applications/forklift.zip https://download.binarynights.com/ForkLift/ForkLift4beta2.zip
unzip /Applications/forklift.zip -d /Applications/
rm /Applications/forklift.zip
defaults write -g NSFileViewer -string com.binarynights.ForkLift;
defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType="public.folder";LSHandlerRoleAll="com.binarynights.ForkLift";}'

brew install --cask hyper

curl -Lo /Applications/macmousefix.zip https://github.com/noah-nuebling/mac-mouse-fix/releases/download/3.0.0-Beta-6/MacMouseFixApp.zip
unzip /Applications/macmousefix.zip -d /Applications/
rm /Applications/macmousefix.zip

brew install --cask obsidian
brew install --cask raycast
brew install --cask rectangle
brew install --cask syncthing
brew install --cask visual-studio-code
brew install --cask google-chrome
brew install --cask iina
brew install --cask protonvpn
brew install --cask qbittorrent
