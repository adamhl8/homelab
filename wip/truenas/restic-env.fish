#!/usr/bin/bash

export RESTIC_REPOSITORY='s3:s3.us-west-004.backblazeb2.com/sid-storage'
export AWS_DEFAULT_REGION=us-west-004
export AWS_ACCESS_KEY_ID=$(sops -d --extract "['backblaze_application_key_id']" ~/secrets.yaml)
export AWS_SECRET_ACCESS_KEY=$(sops -d --extract "['backblaze_application_key']" ~/secrets.yaml)
export RESTIC_PASSWORD=$(sops -d --extract "['restic_password']" ~/secrets.yaml)
export RESTIC_COMPRESSION=max
export RESTIC_PACK_SIZE=100
