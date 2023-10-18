#!/usr/bin/env python

from shellrunner import X


def main():
    X("mkdir ~/tmp/")
    X(["cd ~/tmp/", "git clone https://github.com/ironicbadger/docker-snapraid.git"])
    X(["cd ~/tmp/docker-snapraid/", "~/tmp/docker-snapraid/build.sh"], show_output=False)
    X("dpkg-deb -x ~/tmp/docker-snapraid/build/snapraid-from-source.deb ~/tmp/")
    X("mv -f ~/tmp/usr/local/bin/snapraid ~/bin/")
    X("rm -rf ~/tmp/")


if __name__ == "__main__":
    main()
