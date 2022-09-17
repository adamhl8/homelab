#!/bin/bash

curl -s https://api.github.com/repos/restic/restic/releases/latest | grep -o -E "https://(.*)restic(.*)linux_amd64.bz2" | sed 1q | xargs curl -Lo ~/restic/restic.bz2
bzip2 -d ~/restic/restic.bz2
chmod 755 ~/restic/restic
