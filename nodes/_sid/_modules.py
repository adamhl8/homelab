from typing import NamedTuple

import nodes._sid.nas.disks.init as disks
import nodes._sid.nas.init as nas
import nodes._sid.nas.restic.init as restic
import nodes._sid.nas.smb.init as smb
import nodes._sid.nas.snapraid.init as snapraid


class Disks:
    def __call__(self) -> None:
        disks.main()


class Nas:
    def __call__(self) -> None:
        nas.main()


class Restic:
    def __call__(self) -> None:
        restic.main()


class Smb:
    def __call__(self) -> None:
        smb.main()


class Snapraid:
    def __call__(self) -> None:
        snapraid.main()


class SidModules(NamedTuple):
    disks = Disks()
    nas = Nas()
    restic = Restic()
    smb = Smb()
    snapraid = Snapraid()


sid = SidModules()
