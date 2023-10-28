#!/usr/bin/env python

from shellrunner import X


def main() -> None:
    X(
        "curl -Lo ~/snapraid/snapraid-btrfs https://raw.githubusercontent.com/automorphism88/snapraid-btrfs/master/snapraid-btrfs"
    )
    X("chmod 755 ~/snapraid/snapraid-btrfs")


if __name__ == "__main__":
    main()
