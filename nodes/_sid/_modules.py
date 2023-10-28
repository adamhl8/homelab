from typing import NamedTuple

import nodes._sid.restic.init as restic
import nodes._sid.smb.init as smb
import nodes._sid.snapraid.init as snapraid
import nodes._sid.storage.init as storage


class Restic:
    def __call__(self) -> None:
        restic.main()


class Smb:
    def __call__(self) -> None:
        smb.main()


class Snapraid:
    def __call__(self) -> None:
        snapraid.main()


class Storage:
    def __call__(self) -> None:
        storage.main()


class SidModules(NamedTuple):
    restic = Restic()
    smb = Smb()
    snapraid = Snapraid()
    storage = Storage()


sid = SidModules()
