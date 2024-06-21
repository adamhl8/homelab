#!/usr/bin/env python

import os
import re

from hl_helpers import homelab_paths as paths
from hl_helpers import send_email
from shellrunner import ShellCommandError, X


def backup() -> None:
    print("== Starting backup... ==")
    X("""echo (sops -d --extract "['homelab_password']" ~/secrets.yaml) | sudo -S -v""")

    print("== Backing up docker data... ==")
    X("sudo -S tar -vuf /mnt/storage/Backups/docker.tar -C ~/docker/ .")

    print("== Running SnapRAID tasks...")
    X("python ~/snapraid/snapraid-btrfs-runner.py -c ~/snapraid/snapraid-btrfs-runner.conf")

    restic_output = X(
        [
            "echo '== Starting restic backup... =='",
            f"source {paths.nodes.sid}/restic/restic-env.fish",
            "~/restic/restic backup /mnt/storage --ignore-inode -vv --exclude-file ~/restic/excludes",
            "echo '== Cleaning up... =='",
            "~/restic/restic forget --prune --keep-within 1m",
            "echo '== Checking integrity... =='",
            "~/restic/restic check",
        ],
        show_output=False,
    ).out
    restic_output = re.sub("unchanged.*\n", "", restic_output)
    print(restic_output)


def main() -> None:
    os.environ["SHELLRUNNER_SHELL"] = "/home/linuxbrew/.linuxbrew/bin/fish"
    os.environ["SHELLRUNNER_SHOW_COMMAND"] = "False"

    try:
        backup()
    except Exception as e:
        timestamp = X(r"date +%F_%T").out
        error_message = f"{timestamp}\nAn error occurred during backup:\n\n"

        if isinstance(e, ShellCommandError):
            error_message += e.out
        else:
            error_message += f"{e}"

        print(error_message)
        send_email(
            from_addr="sid@adamhl.dev",
            to_addr="adamhl@pm.me",
            subject="[nas-backup] ERROR",
            body=error_message,
        )
        raise

    timestamp = X(r"date +%F_%T").out
    print(f"== Backup completed at {timestamp} ==")


if __name__ == "__main__":
    main()
