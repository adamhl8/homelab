#!/usr/bin/env python

import json
import os
import re
from pathlib import Path

from hl_helpers import Log
from hl_helpers import homelab_paths as paths
from shellrunner import X


def main() -> None:
    os.environ["SHELLRUNNER_SHOW_OUTPUT"] = "False"
    os.environ["SHELLRUNNER_SHOW_COMMAND"] = "False"

    base_url = "https://opnsense.lan/api/unbound"
    list_endpoint = f"{base_url}/settings/searchHostOverride"
    add_endpoint = f"{base_url}/settings/addHostOverride"
    delete_endpoint = f"{base_url}/settings/delHostOverride"
    restart_endpoint = f"{base_url}/service/restart"

    opnsense_key = X("""sops -d --extract "['opnsense_key']" ~/secrets.yaml""").out
    opnsense_secret = X("""sops -d --extract "['opnsense_secret']" ~/secrets.yaml""").out
    auth = f"{opnsense_key}:{opnsense_secret}"
    base_curl_cmd = f"curl -s -k -u '{auth}'"
    headers = "Content-Type: application/json"

    Log.warn("Getting current overrides...")
    list_response = json.loads(X(f"{base_curl_cmd} -X GET '{list_endpoint}'").out)
    overrides = list_response["rows"]

    Log.warn("Deleting current overrides...")
    for override in overrides:
        override_uuid = override["uuid"]
        X(f"{base_curl_cmd} -X POST -d '' '{delete_endpoint}/{override_uuid}'")

    with Path.open(paths.caddyfile) as file:
        caddyfile = file.read()

    matches = re.findall(r"@(\w+) host ([\w\.]+)", caddyfile)

    Log.warn("Saving rewrites...")
    caddy_ip_address = "10.8.8.4"
    for match in matches:
        domain = match[1]
        override_data = {
            "host": {
                "enabled": "1",
                "hostname": "*",
                "domain": domain,
                "rr": "A",
                "mxprio": "",
                "mx": "",
                "server": caddy_ip_address,
                "description": "",
            }
        }
        X(
            f"{base_curl_cmd} -X POST -H '{headers}' -d '{json.dumps(override_data)}' '{add_endpoint}'",
        )
        Log.info(f"Added: {domain}")

    Log.warn("Restarting unbound...")
    X(f"{base_curl_cmd} -X POST -d '' '{restart_endpoint}'")


if __name__ == "__main__":
    main()
