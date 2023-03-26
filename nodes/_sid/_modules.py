from typing import NamedTuple

import nodes._sid.ksmbd.init as ksmbd
import nodes._sid.restic.init as restic
import nodes._sid.snapraid.init as snapraid
import nodes._sid.storage.init as storage


class Ksmbd:
    def __call__(self):
        ksmbd.main()


class Restic:
    def __call__(self):
        restic.main()


class Snapraid:
    def __call__(self):
        snapraid.main()


class Storage:
    def __call__(self):
        storage.main()


class SidModules(NamedTuple):
    ksmbd = Ksmbd()
    restic = Restic()
    snapraid = Snapraid()
    storage = Storage()


sid = SidModules()
