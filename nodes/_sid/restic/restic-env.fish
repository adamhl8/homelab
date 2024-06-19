#!/usr/bin/env fish

set -gx RESTIC_REPOSITORY 's3:s3.us-west-004.backblazeb2.com/sid-storage'
set -gx AWS_DEFAULT_REGION 'us-west-004'
set -gx AWS_ACCESS_KEY_ID (sops -d --extract "['backblaze_application_key_id']" ~/secrets.yaml)
set -gx AWS_SECRET_ACCESS_KEY (sops -d --extract "['backblaze_application_key']" ~/secrets.yaml)
set -gx RESTIC_PASSWORD (sops -d --extract "['restic_password']" ~/secrets.yaml)
set -gx RESTIC_COMPRESSION 'max'
set -gx RESTIC_PACK_SIZE '100'
