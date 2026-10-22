from pathlib import Path

from pyinfra.operations import git

from lib.aws import aws_profile
from lib.brew import brew_bundle
from lib.dotfiles import shared_dotfiles
from lib.fish import fish_setup
from lib.fs import put_files
from lib.groups import require_group
from lib.paths import HOME, REPO, SHARED_FILES
from lib.ssh import ssh_keys
from lib.tools import bun_globals
from macbook.dock import dock
from macbook.fonts import iosevka_fonts
from macbook.hostname import set_hostname
from macbook.macos_defaults import macos_defaults
from macbook.power import power
from macbook.wallpaper import wallpaper

require_group(__file__)

FILES = Path(__file__).resolve().parent / "files"

set_hostname("adam-macbook", "Adam’s MacBook Pro")  # ruff:ignore[ambiguous-unicode-character-string]

macos_defaults(
    {
        "NSGlobalDomain": {
            "AppleActionOnDoubleClick": "None",
            "AppleInterfaceStyle": "Dark",
            "AppleKeyboardUIMode": 1,
            "ApplePressAndHoldEnabled": False,
            "AppleShowAllExtensions": True,
            "InitialKeyRepeat": 15,
            "KeyRepeat": 2,
            "NSAutomaticCapitalizationEnabled": False,
            "NSAutomaticPeriodSubstitutionEnabled": False,
            "NSAutomaticSpellingCorrectionEnabled": False,
            "NSFileViewer": "com.binarynights.ForkLift",
            "WebAutomaticSpellingCorrectionEnabled": False,
            "com.apple.keyboard.fnState": True,
            "com.apple.swipescrolldirection": False,
            "com.apple.trackpad.forceClick": False,
        },
        "com.apple.AppleMultitouchTrackpad": {
            "Clicking": True,
            "ForceSuppressed": True,
        },
        "com.apple.driver.AppleBluetoothMultitouch.trackpad": {
            "Clicking": True,
        },
        "com.apple.WindowManager": {
            "EnableTiledWindowMargins": False,
            "EnableTilingByEdgeDrag": False,
            "EnableTilingOptionAccelerator": False,
            "EnableTopTilingByEdgeDrag": False,
            "GloballyEnabled": False,
            "HideDesktop": True,
        },
        "com.apple.dock": {
            "autohide": True,
            "autohide-delay": 0.2,
            "expose-group-apps": True,
            "mineffect": "scale",
            "minimize-to-application": True,
            "show-recents": False,
            "showLaunchpadGestureEnabled": False,
            "tilesize": 64,
            "wvous-br-corner": 1,
            "wvous-br-modifier": 0,
        },
        "com.apple.finder": {
            "NewWindowTarget": "PfAF",
            "ShowPathbar": True,
        },
        "com.apple.menuextra.clock": {
            "ShowAMPM": True,
            "ShowDate": False,
            "ShowDayOfWeek": True,
            "TimeAnnouncementsEnabled": False,
        },
        "com.jordanbaird.Ice": {
            "AutoRehide": False,
            "EnableAlwaysHiddenSection": False,
            "HideApplicationMenus": True,
            "IceBarLocation": 0,
            "ItemSpacingOffset": -8,
            "RehideInterval": 15,
            "RehideStrategy": 0,
            "ShowAllSectionsOnUserDrag": True,
            "ShowIceIcon": True,
            "ShowOnClick": True,
            "ShowOnHover": False,
        },
        # AltTab writes string-typed defaults, keep values as strings or the check never passes
        "com.lwouis.alt-tab-macos": {
            "appearanceSize": "3",
            "captureWindowsInBackground": "true",
            "crashPolicy": "1",
            "menubarIcon": "0",
            "menubarIconShown": "false",
            "showHiddenWindows": "2",
            "showHiddenWindows2": "2",
            "showMinimizedWindows": "2",
            "showMinimizedWindows2": "2",
            "showOnScreen": "0",
            "spacesToShow": "1",
            "spacesToShow2": "1",
            "startAtLogin": "true",
            "updatePolicy": "2",
        },
        "cc.ffitch.shottr": {
            "customGradFrom": "#221448",
            "customGradTo": "#919BD2",
            "defaultColor": "#FF0C01",
            "defaultFolder": "/Users/adam/Documents",
            "downscaleOnSave": False,
            "enableMagicMouseZoom": False,
            "notificationType": "custom",
            "ocrRemoveBreaks": False,
            "preferLargeWindow": False,
            "primaryOCRLang": "en-US",
            "realPixels": False,
            "saveFormat": "Auto",
            "saveOnEsc": False,
            "showMenubarIcon": True,
            "snappingMode": 2,
            "uploadMode": "none",
            "windowShadow": "transparent",
            "windowSolidColor": "#404448",
        },
    },
    handlers={
        "public.folder": "com.binarynights.ForkLift",
        "com.adobe.pdf": "com.adobe.Acrobat.Pro",
    },
    # Ice/AltTab/Shottr are deliberately not killed: killall would terminate them without
    # relaunch, and they pick up defaults on next launch
    kill=["Dock", "Finder", "ControlCenter"],
)

brew_bundle(SHARED_FILES / "Brewfile", FILES / "Brewfile")

bun_globals("@adamhl8/declutter", "delete-refs", "pnpm", "turbo")

iosevka_fonts()

dock(
    "/Applications/ForkLift.app",
    "/Applications/Zen.app",
    "/Applications/Obsidian.app",
    "/Applications/Zed.app",
    "/Applications/Ghostty.app",
    "/Applications/Discord.app",
    str(HOME / "Applications/Chrome Apps.localized/Messages.app"),
    "/Applications/Signal.app",
    "/Applications/1Password.app",
    "/Applications/Parsec.app",
    "/Applications/Slack.app",
)

power()

ssh_keys({"adam-macbook": "id_ed25519"})

aws_profile()

put_files(
    shared_dotfiles()
    | {
        SHARED_FILES / "zed/settings.json": HOME / ".config/zed/settings.json",
        SHARED_FILES / "zed/keymap.json": HOME / ".config/zed/keymap.json",
        SHARED_FILES / "zed/tasks.json": HOME / ".config/zed/tasks.json",
        SHARED_FILES / "zed/snippets/typescript.json": (
            HOME / ".config/zed/snippets/typescript.json"
        ),
        FILES / "ghostty": HOME / ".config/ghostty/config",
        FILES / "DefaultKeyBinding.dict": HOME / "Library/KeyBindings/DefaultKeyBinding.dict",
        FILES / "wallpaper.jpg": HOME / ".config/wallpaper.jpg",
        FILES / "git-ignore": HOME / ".config/git/ignore",
        FILES / "codebook.toml": HOME / ".config/codebook/codebook.toml",
        FILES / "gh-config.yml": HOME / ".config/gh/config.yml",
        FILES / "claude/settings.json": HOME / ".claude/settings.json",
        FILES / "claude/CLAUDE.md": HOME / ".claude/CLAUDE.md",
        FILES / "claude/commands/organize-stars.md": HOME / ".claude/commands/organize-stars.md",
    }
)

wallpaper(HOME / ".config/wallpaper.jpg")

fish_setup()

git.config(
    name="Point origin at SSH",
    key="remote.origin.url",
    value="git@github.com:adamhl8/homelab.git",
    repo=str(REPO),
)
