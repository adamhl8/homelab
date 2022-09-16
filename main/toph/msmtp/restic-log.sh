#!/bin/bash

sed -i '1iTo: adamhl@pm.me' ~/restic/restic.log
sed -i '2iFrom: msmtp@adamhl.dev' ~/restic/restic.log
sed -i '3iSubject: [restic-backup] ERROR' ~/restic/restic.log
msmtp -C ~/msmtp/msmtp.conf -t < ~/restic/restic.log