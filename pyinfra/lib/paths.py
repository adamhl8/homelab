from pathlib import Path

HOME = Path.home()
REPO = Path(__file__).resolve().parents[2]
SECRETS = REPO / "secrets"
SHARED_FILES = REPO / "pyinfra" / "files"
AGE_KEY = HOME / ".config" / "sops" / "age" / "keys.txt"
