from collections.abc import Generator
from typing import override

from pyinfra import host, logger, state
from pyinfra.api import FactBase, operation
from pyinfra.api.output import format_text
from pyinfra.operations.util.files import generate_color_diff


class _CommandSucceeds(FactBase[bool]):
    """Whether cmd exits 0. The wrapper keeps a failing check from failing the host."""

    @override
    def command(self, cmd: str) -> str:
        return f"{{ {cmd}; }} >/dev/null 2>&1; echo $?"

    @override
    def process(self, output: list[str]) -> bool:
        return output[-1] == "0"


class _CommandOutput(FactBase[list[str]]):
    """cmd's stdout lines. The wrapper keeps a failing command from failing the host."""

    @override
    def command(self, cmd: str) -> str:
        return f"{{ {cmd}; }} 2>/dev/null || true"

    @override
    def process(self, output: list[str]) -> list[str]:
        return output

    # process only runs when there is stdout, so no output must still mean "observed nothing"
    @staticmethod
    @override
    def default() -> list[str]:
        return []


@operation()
def converge(
    check: str, fix: str, noop: str, diff: tuple[str, str] | None = None
) -> Generator[str]:
    """Run fix unless check exits 0.

    diff is (observe_cmd, desired_text): when the check fails under --diff, observe_cmd's
    output is diffed against desired_text like pyinfra's file ops do.
    Ops needing multiple or dynamic commands still use @operation directly.
    """
    # _sudo=False: facts inherit the op's _sudo, but checks don't need root
    if host.get_fact(_CommandSucceeds, cmd=check, _sudo=False):
        host.noop(noop)
        return
    if diff and state.config.DIFF:
        observe, desired = diff
        current = host.get_fact(_CommandOutput, cmd=observe, _sudo=False)
        name = (host.current_op_global_arguments or {}).get("name") or "state"
        host.log(f"Will change: {format_text(name, bold=True)}", logger.info)
        for line in generate_color_diff(current, desired.splitlines()):
            logger.info("  %s", line)
        logger.info("")
    yield fix
