#!/usr/bin/env python

from shellrunner import X


def main() -> None:
    X(
        "curl -Lo ~/snapraid/snapraid-btrfs-runner.py https://raw.githubusercontent.com/fmoledina/snapraid-btrfs-runner/master/snapraid-btrfs-runner.py"
    )


X("chmod 755 ~/snapraid/snapraid-btrfs-runner.py")

if __name__ == "__main__":
    main()
