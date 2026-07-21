from collections.abc import Generator
from typing import override

from pyinfra import host
from pyinfra.api import FactBase, operation


class _CommandSucceeds(FactBase[bool]):
    """Whether cmd exits 0. The wrapper keeps a failing check from failing the host."""

    @override
    def command(self, cmd: str) -> str:
        return f"{{ {cmd}; }} >/dev/null 2>&1; echo $?"

    @override
    def process(self, output: list[str]) -> bool:
        return output[-1] == "0"


@operation()
def converge(check: str, fix: str, noop: str) -> Generator[str]:
    """Run fix unless check exits 0.

    Ops needing multiple or dynamic commands still use @operation directly.
    """
    # _sudo=False: facts inherit the op's _sudo, but checks don't need root
    if host.get_fact(_CommandSucceeds, cmd=check, _sudo=False):
        host.noop(noop)
        return
    yield fix
