import shlex
from typing import TYPE_CHECKING

from lib.operations.converge import converge

if TYPE_CHECKING:
    from pathlib import Path

_READ = "osascript -e 'tell application \"Finder\" to get POSIX path of (desktop picture as alias)'"


def wallpaper(path: Path | str) -> None:
    """Converge the desktop picture via m-cli (installed from the Brewfile)."""
    p = shlex.quote(str(path))
    converge(
        check=f'[ "$({_READ} 2>/dev/null)" = {p} ]',
        fix=f"m wallpaper --set {p}",
        noop="wallpaper is set",
        name="Set wallpaper",
    )
