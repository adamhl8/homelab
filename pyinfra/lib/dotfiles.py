from typing import TYPE_CHECKING

from lib.fs import Dest
from lib.paths import HOME, SHARED_FILES

if TYPE_CHECKING:
    from pathlib import Path


def shared_dotfiles() -> dict[Path, Path | Dest]:
    """Return the dotfiles every host gets, with group extras merged on top."""
    mapping: dict[Path, Path | Dest] = {
        SHARED_FILES / "config.fish": HOME / ".config/fish/config.fish",
        SHARED_FILES / "fish_plugins": HOME / ".config/fish/fish_plugins",
        SHARED_FILES / "micro_bindings.json": HOME / ".config/micro/bindings.json",
        SHARED_FILES / "starship.toml": HOME / ".config/starship.toml",
        SHARED_FILES / ".gitconfig": HOME / ".gitconfig",
        SHARED_FILES / ".prettierrc.mjs": HOME / ".prettierrc.mjs",
        SHARED_FILES / "allowed_signers": Dest(HOME / ".ssh/allowed_signers", mode="600"),
        SHARED_FILES / "ssh_config": Dest(HOME / ".ssh/config", mode="600"),
    }
    # skip hidden files so a stray .DS_Store never lands in ~/bin
    for script in sorted((SHARED_FILES / "bin").iterdir()):
        if not script.name.startswith("."):
            mapping[script] = Dest(HOME / "bin" / script.name, mode="755")
    return mapping
