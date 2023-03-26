from typing import NamedTuple

import nodes.sid.restic.init as restic
import nodes.sid.snapraid.init as snapraid
import nodes.sid.storage.init as storage


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
    restic = Restic()
    snapraid = Snapraid()
    storage = Storage()


sid = SidModules()
