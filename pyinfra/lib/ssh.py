import io
from typing import TYPE_CHECKING

from lib.fs import Dest, put_files
from lib.paths import HOME
from lib.sops import ssh_key

if TYPE_CHECKING:
    from pathlib import Path


def _text(content: str) -> io.StringIO:
    # OpenSSH rejects a private key that doesn't end in a newline.
    return io.StringIO(content if content.endswith("\n") else content + "\n")


def ssh_keys(keys: dict[str, str]) -> None:
    """Write the given {sops_key: filename} keypairs from the vault into ~/.ssh."""
    mapping: dict[Path | io.StringIO, Path | Dest] = {}
    for sops_key, filename in keys.items():
        mapping[_text(ssh_key(sops_key, "pri"))] = Dest(HOME / ".ssh" / filename, mode="600")
        mapping[_text(ssh_key(sops_key, "pub"))] = HOME / ".ssh" / f"{filename}.pub"

    put_files(mapping, dir_mode="700")
