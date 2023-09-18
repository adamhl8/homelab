from typing import NamedTuple

import nodes._sid.restic.init as restic
import nodes._sid.smb.init as smb
import nodes._sid.snapraid.init as snapraid
import nodes._sid.storage.init as storage


class Restic:
    def __call__(self):
        restic.main()


class Smb:
    def __call__(self):
        smb.main()


class Snapraid:
    def __call__(self):
        snapraid.main()


class Storage:
    def __call__(self):
        storage.main()


class SidModules(NamedTuple):
    restic = Restic()
    smb = Smb()
    snapraid = Snapraid()
    storage = Storage()


sid = SidModules()
