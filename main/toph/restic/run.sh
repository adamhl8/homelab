#!/bin/bash

sops exec-env ~/secrets.env '~/restic/restic-backup.sh'