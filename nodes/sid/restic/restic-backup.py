from shellrunner import X, ShellCommandError

timestamp = X(r"date +%F_%T")

backblaze_application_key = X("""sops -d --extract "['backblaze_application_key']" ~/secrets.yaml""").out
restic_password = X("""sops -d --extract "['restic_password']" ~/secrets.yaml""").out

try:
  output = X([
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
  ]).out
except ShellCommandError as e:
  

sed -i '\|unchanged.*|d' ~/restic/restic.log

[ ${exit_status} -ne 0 ] && source ~/msmtp/restic-log.sh

mv ~/restic/restic.log ~/restic/${timestamp}_restic.log
