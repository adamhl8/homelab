from lib.operations.converge import converge

_FONTS = [
    f"Iosevka{variant}NerdFont-{style}.ttf"
    for variant in ("", "Terminal")
    for style in ("Regular", "Bold", "Italic", "BoldItalic")
]


def iosevka_fonts() -> None:
    """Converge the Iosevka Nerd Font files from the font-iosevka GitHub release.

    Presence-only check: upgrades are a manual re-download with --clobber.
    """
    checks = " && ".join(f'[ -e "$HOME/Library/Fonts/{f}" ]' for f in _FONTS)
    observe = f'for f in {" ".join(_FONTS)}; do [ -e "$HOME/Library/Fonts/$f" ] && echo "$f"; done'
    converge(
        check=checks,
        fix=(
            'gh release download -R adamhl8/font-iosevka --pattern "*.ttf" '
            '--dir "$HOME/Library/Fonts" --clobber'
        ),
        noop="iosevka fonts are installed",
        name="Install Iosevka fonts",
        diff=(observe, "\n".join(_FONTS)),
    )
