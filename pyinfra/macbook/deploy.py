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
from macbook.hostname import set_hostname

require_group(__file__)

FILES = Path(__file__).resolve().parent / "files"

set_hostname("adam-macbook", "Adam’s MacBook Pro")  # ruff:ignore[ambiguous-unicode-character-string]

brew_bundle(SHARED_FILES / "Brewfile", FILES / "Brewfile")

ssh_keys({"adam-macbook": "id_ed25519"})

aws_profile()

put_files(
    shared_dotfiles()
    | {
        SHARED_FILES / "zed/settings.json": HOME / ".config/zed/settings.json",
        FILES / "ghostty": HOME / ".config/ghostty/config",
        FILES / "DefaultKeyBinding.dict": HOME / "Library/KeyBindings/DefaultKeyBinding.dict",
    }
)

fish_setup()

git.config(
    name="Point origin at SSH",
    key="remote.origin.url",
    value="git@github.com:adamhl8/homelab.git",
    repo=str(REPO),
)
