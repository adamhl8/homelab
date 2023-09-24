#!/usr/bin/env python

import json
import re
from pathlib import Path

import requests
from hl_helpers import homelab_paths as paths
from requests.auth import HTTPBasicAuth
from shellrunner import X


def main():
    base_url = "http://adguard.lan/control/rewrite/"
    list_endpoint = f"{base_url}list"
    add_endpoint = f"{base_url}add"
    delete_endpoint = f"{base_url}delete"
    auth = HTTPBasicAuth(
        "adam",
        X("""sops -d --extract "['homelab_password']" ~/secrets.yaml""", show_output=False).out,
    )
    headers = {"Content-Type": "application/json"}

    rewrites = requests.get(list_endpoint, auth=auth).json()

    for rewrite in rewrites:
        requests.post(delete_endpoint, auth=auth, headers=headers, data=json.dumps(rewrite))

    with Path.open(paths.caddyfile) as file:
        caddyfile = file.read()

    matches = re.findall(r"@(\w+) host ([\w\.]+)", caddyfile)

    for match in matches:
        new_rewrite = {"domain": match[1], "answer": "10.8.8.3"}
        requests.post(add_endpoint, auth=auth, headers=headers, data=json.dumps(new_rewrite))


if __name__ == "__main__":
    main()
