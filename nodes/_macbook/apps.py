from webbrowser import open as open_url

from shellrunner import ShellCommandError, X

brew_apps = [
    "mas",
]


def install_brew_apps(names: list[str]):
    for name in names:
        X(f"brew install {name}")


brew_casks = [
    "google-chrome",
    "brave-browser-beta",
    "discord",
    "obsidian",
    "microsoft-office",
    "mochi",
    "syncthing",
    "tailscale",
    "protonvpn",
    "alt-tab",
    "flameshot",
    "raycast",
    "visual-studio-code",
    "hyper",
    "orbstack",
    "iina",
    "qbittorrent",
    "slack",
    "zoom",
]


def install_brew_casks(casks: list[str]):
    for cask in casks:
        X(f"brew install --cask {cask}")


app_store_app_ids = [
    "470158793",  # Keka
    "1565701763",  # AudioWranger
    "6446061552",  # Signal Shifter
    "1206020918",  # Battery Indicator
    "1611378436",  # Pure Paste
    "1666327168",  # Spaced
]


def install_app_store_apps(app_ids: list[str]):
    for app_id in app_ids:
        X(f"mas install {app_id}")


def install_app_from_zip(name: str, url: str):
    try:
        zip_path = f"/Applications/{name}.zip"
        X(f"curl -Lo {zip_path} '{url}'")
        X(f"unzip {zip_path} -d /Applications/")
        X(f"rm {zip_path}")
    except ShellCommandError as e:
        print("Failed to install app from zip.")
        print(e.out)


def main():
    X("brew tap homebrew/cask-versions")
    install_brew_apps(brew_apps)
    install_brew_casks(brew_casks)
    install_app_store_apps(app_store_app_ids)

    install_app_from_zip(
        "macmousefix",
        "https://github.com/noah-nuebling/mac-mouse-fix/releases/download/3.0.0-Beta-6/MacMouseFixApp.zip",
    )

    install_app_from_zip("forklift", "https://download.binarynights.com/ForkLift/ForkLift4beta3.zip")
    X("defaults write -g NSFileViewer -string com.binarynights.ForkLift")
    X(
        """defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType="public.folder";LSHandlerRoleAll="com.binarynights.ForkLift";}'""",
    )

    X("curl -Lo ~/kekahelper.zip 'https://d.keka.io/helper'")
    X("unzip ~/kekahelper.zip -d ~/")
    X("rm ~/kekahelper.zip")
    X("~/KekaExternalHelper.app/Contents/MacOS/KekaExternalHelper --set-as-default")
    X("rm -rf ~/KekaExternalHelper.app")

    open_url("https://www.tweaking4all.com/software/macosx-software/connectmenow-v4/")
    open_url("https://www.bresink.com/osx/0TinkerTool/download.php")


if __name__ == "__main__":
    main()
