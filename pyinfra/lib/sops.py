import json
import os
import subprocess  # ruff:ignore[suspicious-subprocess-import]
from functools import cache
from typing import Any

from lib.paths import AGE_KEY, SECRETS


@cache
def _load(name: str) -> dict[str, Any]:
    if not AGE_KEY.is_file():
        msg = f"no age identity at {AGE_KEY}\nrun ./bootstrap.sh"
        raise SystemExit(msg)

    # fixed argv, and sops is resolved from PATH on purpose
    result = subprocess.run(  # ruff:ignore[subprocess-without-shell-equals-true]
        ["sops", "-d", "--output-type", "json", str(SECRETS / name)],  # ruff:ignore[start-process-with-partial-path]
        env={**os.environ, "SOPS_AGE_KEY_FILE": str(AGE_KEY)},
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def secret(key: str) -> str:
    return _load("credentials.yaml")[key]


def ssh_key(name: str, part: str) -> str:
    return _load("ssh.yaml")[name][part]
