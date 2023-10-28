#!/usr/bin/env python

from hl_helpers import get_latest_github_release
from shellrunner import X


def main() -> None:
    get_latest_github_release("trapexit/mergerfs", r"mergerfs.*debian-bookworm_amd64\.deb", "~/mergerfs.deb")
    X("sudo apt install ~/mergerfs.deb -y")
    X("rm ~/mergerfs.deb")
    X("mergerfs --version")


if __name__ == "__main__":
    main()
