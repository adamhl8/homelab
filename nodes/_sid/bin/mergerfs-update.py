#!/usr/bin/env python

from shellrunner import X

X(
    'curl -s https://api.github.com/repos/trapexit/mergerfs/releases/latest | string match -r "https://.*/download/.*mergerfs.*debian-bullseye_amd64.deb" | sed 1q | xargs curl -Lo ~/mergerfs.deb',
)
X("sudo apt install ~/mergerfs.deb -y")
X("rm ~/mergerfs.deb")
X("mergerfs --version")
