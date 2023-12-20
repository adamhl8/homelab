#!/usr/bin/env python

import json
import os
import re
from pathlib import Path

from hl_helpers import homelab_paths as paths
from hl_helpers import warn
from shellrunner import X


def main() -> None:
    os.environ["SHELLRUNNER_SHOW_OUTPUT"] = "False"
    os.environ["SHELLRUNNER_SHOW_COMMAND"] = "False"

    base_url = "http://adguard.lan/control/rewrite/"
    list_endpoint = f"{base_url}list"
    add_endpoint = f"{base_url}add"
    delete_endpoint = f"{base_url}delete"
    auth = f"adam:{X("""sops -d --extract "['homelab_password']" ~/secrets.yaml""").out}"
    headers = "Content-Type: application/json"

    warn("Getting current rewrites...")
    rewrites = json.loads(X(f"curl -s -u '{auth}' -X GET '{list_endpoint}'").out)

    warn("Deleting current rewrites...")
    for rewrite in rewrites:
        X(f"curl -u '{auth}' -X POST -H '{headers}' -d '{json.dumps(rewrite)}' '{delete_endpoint}'")

    with Path.open(paths.caddyfile) as file:
        caddyfile = file.read()

    matches = re.findall(r"@(\w+) host ([\w\.]+)", caddyfile)

    warn("Saving rewrites...")
    for match in matches:
        new_rewrite = {"domain": match[1], "answer": "10.8.8.3"}
        X(
            f"curl -u '{auth}' -X POST -H '{headers}' -d '{json.dumps(new_rewrite)}' '{add_endpoint}'",
        )


if __name__ == "__main__":
    main()
