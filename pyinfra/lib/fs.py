from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING

from pyinfra.operations import files

from lib.paths import HOME

if TYPE_CHECKING:
    import io


@dataclass(frozen=True)
class Dest:
    path: Path
    mode: str = "644"


def _display(path: Path) -> str:
    return f"~/{path.relative_to(HOME)}" if path.is_relative_to(HOME) else str(path)


def put_files(mapping: dict[Path | io.StringIO, Path | Dest], dir_mode: str | None = None) -> None:
    """Write the given {src: dest} files, creating parent dirs first."""
    dests = [d if isinstance(d, Dest) else Dest(d) for d in mapping.values()]

    # HOME always exists. Without this, a file landing directly in it would emit
    # a "Create <home_dir>" no-op op every run.
    for parent in sorted({d.path.parent for d in dests} - {HOME}):
        files.directory(name=f"Create {_display(parent)}", path=str(parent), mode=dir_mode)

    for src, dest in zip(mapping, dests, strict=True):
        files.put(
            name=f"Write {_display(dest.path)}",
            src=str(src) if isinstance(src, Path) else src,
            dest=str(dest.path),
            mode=dest.mode,
        )
