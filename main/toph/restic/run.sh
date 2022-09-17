#!/bin/bash

/home/adam/bin/sops exec-env ~/secrets.env '~/restic/restic-backup.sh'
