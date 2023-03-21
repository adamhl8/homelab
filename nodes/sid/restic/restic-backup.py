from pathlib import Path

from shellrunner import ShellCommandError, X

timestamp = X(r"date +%F_%T")

backblaze_application_key = X("""sops -d --extract "['backblaze_application_key']" ~/secrets.yaml""").out
restic_password = X("""sops -d --extract "['restic_password']" ~/secrets.yaml""").out

restic_output = ""
backup_failed = False

try:
    restic_output = X(
        [
            "set -gx RESTIC_REPOSITORY 'b2:toph-storage:/'",
            "set -gx B2_ACCOUNT_ID '00420518bb341580000000001'",
            f"set -gx B2_ACCOUNT_KEY '{backblaze_application_key}'",
            f"set -gx RESTIC_PASSWORD '{restic_password}'",
            "set -gx RESTIC_COMPRESSION 'max'",
            "set -gx RESTIC_PACK_SIZE '100'",
            "echo 'Starting restic backup...'",
            "~/restic/restic backup /mnt/storage -vv --exclude-file ~/restic/excludes",
            "echo 'Cleaning up...'",
            "~/restic/restic forget --prune --keep-within 1m",
            "echo 'Checking integrity...'",
            "~/restic/restic check",
        ]
    ).out
except ShellCommandError as e:
    restic_output = e.out
    backup_failed = True

(Path.home() / "restic/restic.log").write_text(restic_output)

X(r"sed -i '\|unchanged.*|d' ~/restic/restic.log")

if backup_failed:
    X("~/msmtp/restic-log.py")

X(f"mv ~/restic/restic.log ~/restic/{timestamp}_restic.log")

    message["From"] = "sid-restic@adamhl.dev"
    message["To"] = "adamhl@pm.me"
    message["Subject"] = "[restic-backup] ERROR"