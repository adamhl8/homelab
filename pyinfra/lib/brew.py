from typing import TYPE_CHECKING

from lib.operations.converge import converge

if TYPE_CHECKING:
    from pathlib import Path

# pyinfra converges the installed set only, upgrades belong to system-update
_NO_UPGRADE = "HOMEBREW_BUNDLE_NO_UPGRADE=1"


def _bundle(cmd: str, brewfiles: str) -> str:
    # capture cat first so a missing file aborts before brew runs, cleanup --force with a
    # partial list would uninstall everything else
    return f'merged="$(cat {brewfiles})" && printf \'%s\\n\' "$merged" | {cmd} --file=-'


def brew_bundle(*brewfiles: Path) -> None:
    """Converge installed brew packages to the union of the given Brewfiles."""
    files = " ".join(str(f) for f in brewfiles)
    converge(
        check=_bundle(f"{_NO_UPGRADE} brew bundle check", files),
        fix=_bundle(f"{_NO_UPGRADE} brew bundle install", files),
        noop="Brewfiles are satisfied",
        name="Install brew packages",
    )
    converge(
        check=_bundle("brew bundle cleanup", files),
        fix=_bundle("brew bundle cleanup --force", files),
        noop="nothing installed outside the Brewfiles",
        name="Remove brew packages not in Brewfile",
    )
