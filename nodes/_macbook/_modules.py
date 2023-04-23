from typing import NamedTuple

from nodes._macbook import apps


class Apps:
    def __call__(self):
        apps.main()


class MacbookModules(NamedTuple):
    apps = Apps()


macbook = MacbookModules()
