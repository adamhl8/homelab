import webbrowser
from pathlib import Path
from urllib.parse import urlparse

from hl_helpers import get_latest_github_release
from shellrunner import X

brew_apps = [
    "mas",
]


def install_brew_apps(names: list[str]):
    for name in names:
        X(f"brew install {name}")


brew_casks = [
    "google-chrome",
    "firefox-developer-edition",
    "discord",
    "obsidian",
    "microsoft-office",
    "adobe-acrobat-pro",
    "forklift",
    "anki",
    "syncthing",
    "tailscale",
    "protonvpn",
    "alt-tab",
    "linearmouse",
    "flameshot",
    "raycast",
    "cursor",
    "hyper",
    "orbstack",
    "utm",
    "iina",
    "qbittorrent",
    "slack",
    "zoom",
]


def install_brew_casks(casks: list[str]):
    for cask in casks:
        X(f"brew install --cask {cask} -f")


app_store_app_ids = [
    "470158793",  # Keka
    "1565701763",  # AudioWrangler
    "6446061552",  # Signal Shifter
    "1611378436",  # Pure Paste
    "1558360383",  # Menu Bar Calendar
]


def install_app_store_apps(app_ids: list[str]):
    for app_id in app_ids:
        X(f"mas install {app_id}")


def get_file_from_uri(uri: str):
    parsed_uri = urlparse(uri)

    if parsed_uri.scheme in ["http", "https"]:
        tmp_path = Path.home() / "tmp_hl_download"
        suffix = Path(parsed_uri.path).suffix
        path = tmp_path.with_suffix(suffix).resolve()
        X(f"curl -Lo '{path}' '{uri}'")
    elif parsed_uri.scheme == "file":
        path = parsed_uri.path
    else:
        message = f"Unsupported URI scheme: {parsed_uri.scheme}"
        raise ValueError(message)

    return path


def install_app_from_zip(uri: str):
    zip_path = get_file_from_uri(uri)
    X(f"unzip -o -q '{zip_path}' -d /Applications/")
    X(f"rm '{zip_path}'")


def install_app_from_dmg(uri: str):
    dmg_path = get_file_from_uri(uri)
    volume_path = "/Volumes/tmp_hl_volume"

    X(f"hdiutil attach '{dmg_path}' -mountpoint '{volume_path}' -quiet")
    X(f"cp -r '{volume_path}'/*.app /Applications/")
    X(f"hdiutil unmount '{volume_path}'")
    X(f"rm '{dmg_path}'")


def main():
    X("brew tap homebrew/cask-versions")
    install_brew_apps(brew_apps)
    install_brew_casks(brew_casks)
    install_app_store_apps(app_store_app_ids)

    install_app_from_dmg("https://www.tweaking4all.com/downloads/ConnectMeNow4-v4-macOS-arm64.dmg")
    install_app_from_dmg("https://www.macbartender.com/B2/updates/B5Latest/Bartender%205.dmg")
    webbrowser.open("https://www.bresink.com/osx/0TinkerTool/download.php")

    # QuickLook Video
    get_latest_github_release("Marginal/QLVideo", r"QLVideo.*dmg", "~/QLVideo.dmg")
    install_app_from_dmg(Path("~/QLVideo.dmg").expanduser().resolve(strict=True).as_uri())

    # Forklift
    X("defaults write -g NSFileViewer -string com.binarynights.ForkLift")
    X(
        """defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add '{LSHandlerContentType="public.folder";LSHandlerRoleAll="com.binarynights.ForkLift";}'""",
    )

    # Keka
    X("curl -Lo ~/kekahelper.zip 'https://d.keka.io/helper'")
    X("unzip ~/kekahelper.zip -d ~/")
    X("rm ~/kekahelper.zip")
    X("~/KekaExternalHelper.app/Contents/MacOS/KekaExternalHelper --set-as-default")
    X("rm -rf ~/KekaExternalHelper.app")


if __name__ == "__main__":
    main()
