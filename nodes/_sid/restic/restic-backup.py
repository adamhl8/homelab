import os
import re
from pathlib import Path

import hl_helpers as helpers
from shellrunner import ShellCommandError, X

os.environ["SHELLRUNNER_SHELL"] = "fish"

timestamp = X(r"date +%F_%T").out

backblaze_application_key_id = X(
    """sops -d --extract "['backblaze_application_key_id']" ~/secrets.yaml""",
    show_output=False,
).out
backblaze_application_key = X(
    """sops -d --extract "['backblaze_application_key']" ~/secrets.yaml""",
    show_output=False,
).out
restic_password = X("""sops -d --extract "['restic_password']" ~/secrets.yaml""", show_output=False).out

restic_output = ""
backup_failed = False

try:
    restic_output = X(
        [
            "set -gx RESTIC_REPOSITORY 's3:s3.us-west-004.backblazeb2.com/sid-storage'",
            "set -gx AWS_DEFAULT_REGION 'us-west-004'",
            f"set -gx AWS_ACCESS_KEY_ID '{backblaze_application_key_id}'",
            f"set -gx AWS_SECRET_ACCESS_KEY '{backblaze_application_key}'",
            f"set -gx RESTIC_PASSWORD '{restic_password}'",
            "set -gx RESTIC_COMPRESSION 'max'",
            "set -gx RESTIC_PACK_SIZE '100'",
            "echo 'Starting restic backup...'",
            "~/restic/restic backup /mnt/storage -vv --exclude-file ~/restic/excludes",
            "echo 'Cleaning up...'",
            "~/restic/restic forget --prune --keep-within 1m",
            "echo 'Checking integrity...'",
            "~/restic/restic check",
        ],
    ).out
except ShellCommandError as e:
    restic_output = e.out
    backup_failed = True

restic_output = re.sub("unchanged.*\n", "", restic_output)
(Path.home() / "restic/restic.log").write_text(restic_output)

if backup_failed:
    helpers.send_email(
        from_addr="sid-restic@adamhl.dev",
        to_addr="adamhl@pm.me",
        subject="[restic-backup] ERROR",
        body=restic_output,
    )

X(f"mv ~/restic/restic.log ~/restic/{timestamp}_restic.log")
