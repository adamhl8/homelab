from typing import NamedTuple

from nodes._macbook import install_apps


class InstallApps:
    def __call__(self):
        install_apps.main()


class MacbookModules(NamedTuple):
    install_apps = InstallApps()


macbook = MacbookModules()
