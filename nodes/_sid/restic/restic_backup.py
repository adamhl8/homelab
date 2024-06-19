import os
import re
from pathlib import Path

from hl_helpers import homelab_paths as paths
from hl_helpers import send_email
from shellrunner import ShellCommandError, X


def main() -> None:
    os.environ["SHELLRUNNER_SHELL"] = "/home/linuxbrew/.linuxbrew/bin/fish"

    timestamp = X(r"date +%F_%T").out

    restic_output = ""
    backup_failed = False

    try:
        restic_output = X(
            [
                f"source {paths.nodes.sid}/restic/restic-env.fish",
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
        send_email(
            from_addr="sid-restic@adamhl.dev",
            to_addr="adamhl@pm.me",
            subject="[restic-backup] ERROR",
            body=restic_output,
        )

    X(f"mv ~/restic/restic.log ~/restic/{timestamp}_restic.log")


if __name__ == "__main__":
    main()
