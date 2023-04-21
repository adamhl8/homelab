from shellrunner import X

def install_app_from_zip(name: str, url: str):
    zip_path = "/Applications/{name}.zip"
    X(f"curl -Lo {zip_path} '{url}'")
    X(f"unzip {zip_path} -d /Applications/")
    X(f"rm {zip_path}")

def main():

    # TinkerTool
    brew install --cask alt-tab
    brew install --cask slack
    brew install mas
    mas install 1206020918 # Battery Indicator
    mas install 1565701763 # AudioWranger
    mas install 6446061552 # Signal Shifter
    mas install 1611378436 # Pure Paste
    mas install 1666327168 # Spaced
    mas install 470158793 # Keka
    curl -Lo ~/kekahelper.zip 'https://d.keka.io/helper'
    unzip ~/kekahelper.zip -d ~/
    rm ~/kekahelper.zip
    ~/KekaExternalHelper.app/Contents/MacOS/KekaExternalHelper --set-as-default
    rm -rf ~/KekaExternalHelper.app

    brew install --cask tailscale
    brew install --cask discord
    brew install --cask docker
    brew tap homebrew/cask-versions
    brew install --cask firefox-developer-edition

    install_app_from_zip("forklift", "https://download.binarynights.com/ForkLift/ForkLift4beta2.zip")

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
    brew install --cask zoom
