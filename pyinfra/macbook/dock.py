import shlex
from pathlib import Path

from lib.operations.converge import converge


def dock(*apps: str) -> None:
    """Converge the Dock's persistent apps to exactly the given .app paths, in order."""
    stems = "\n".join(Path(a).stem for a in apps)
    adds = " && ".join(f"dockutil --add {shlex.quote(a)} --no-restart" for a in apps)
    converge(
        check=f'[ "$(dockutil --list | cut -f1)" = {shlex.quote(stems)} ]',
        fix=f"dockutil --remove all --no-restart && {adds} && killall Dock",
        noop="dock is set",
        name="Set dock apps",
        diff=("dockutil --list | cut -f1", stems),
    )
