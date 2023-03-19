#!/usr/bin/env python

from shellrunner import X

X(
    "curl -Lo ~/snapraid/snapraid-btrfs https://raw.githubusercontent.com/automorphism88/snapraid-btrfs/master/snapraid-btrfs",
)
X("chmod 755 ~/snapraid/snapraid-btrfs")
