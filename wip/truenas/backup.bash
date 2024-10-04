#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

source /mnt/nas/adam/bin/restic-env.bash
restic backup /mnt/nas/storage
restic forget --prune --keep-within 1m
restic check
