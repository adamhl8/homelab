from shellrunner import ShellCommandError, X

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
        X(f"brew install --cask {cask}")


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


def install_app_from_zip(name: str, url: str):
    try:
        zip_path = f"/Applications/{name}.zip"
        X(f"curl -Lo '{zip_path}' '{url}'")
        X(f"unzip '{zip_path}' -d /Applications/")
        X(f"rm '{zip_path}'")
    except ShellCommandError as e:
        print("Failed to install app from zip.")
        print(e.out)


def install_app_from_dmg(name: str, url: str):
    try:
        dmg_path = f"/Applications/{name}.dmg"
        volume_path = f"/Volumes/{name}"
        X(f"curl -Lo '{dmg_path}' '{url}'")
        X(f"hdiutil attach '{dmg_path}' -mountpoint '{volume_path}' -quiet")
        X(f"cp -r '{volume_path}'/*.app /Applications/")
        X(f"hdiutil unmount '{volume_path}'")
        X(f"rm '{dmg_path}'")
    except ShellCommandError as e:
        print("Failed to install app from dmg.")
        print(e.out)


def get_tinker_tool():
    form_html = X(
        "curl -s 'https://www.bresink.com/osx/0TinkerTool/download.php' | xq -n -q 'form'",
    ).out
    download_link = X(f"echo '{form_html}' | xq -q 'form' -a 'action'").out
    key1 = X(f"echo '{form_html}' | xq -q '#key1' -a 'value'").out
    key2 = X(f"echo '{form_html}' | xq -q '#key2' -a 'value'").out
    key3 = X(f"echo '{form_html}' | xq -q '#key3' -a 'value'").out

    request_data = f"Download=Download&key1={key1}&key2={key2}&key3={key3}"
    response = X(f"curl -s '{download_link}' --compressed -X POST --data-raw '{request_data}'").out
    download_path = X(f"echo '{response}' | xq -q 'a' -a 'href' | grep PHPSESSID").out
    full_download_url = f"https://www.bresink.com/{download_path}"

    install_app_from_dmg("TinkerTool", full_download_url)


def main():
    X("brew tap homebrew/cask-versions")
    install_brew_apps(brew_apps)
    install_brew_casks(brew_casks)
    install_app_store_apps(app_store_app_ids)

    install_app_from_dmg("ConnectMeNow4", "https://www.tweaking4all.com/downloads/ConnectMeNow4-v4-macOS-arm64.dmg")
    install_app_from_dmg("Bartender 5", "https://www.macbartender.com/B2/updates/B5Latest/Bartender%205.dmg")
    get_tinker_tool()

    # QuickLook Video
    quicklook_video_url = X(
        'curl -s https://api.github.com/repos/Marginal/QLVideo/releases/latest | string match -r "https://.*/download/.*QLVideo.*dmg" | sed 1q',
    ).out
    install_app_from_dmg("QuickLook Video", quicklook_video_url)

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
