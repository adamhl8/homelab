import shlex

from lib.operations.converge import converge


def set_hostname(hostname: str, computer_name: str) -> None:
    """Converge HostName/LocalHostName to hostname and ComputerName to computer_name."""
    h = shlex.quote(hostname)
    c = shlex.quote(computer_name)
    converge(
        # scutil --get errors when a name is unset
        check=(
            f'[ "$(scutil --get HostName 2>/dev/null)" = {h} ] && '
            f'[ "$(scutil --get LocalHostName 2>/dev/null)" = {h} ] && '
            f'[ "$(scutil --get ComputerName 2>/dev/null)" = {c} ]'
        ),
        fix=(
            f"scutil --set HostName {h} && "
            f"scutil --set LocalHostName {h} && "
            f"scutil --set ComputerName {c}"
        ),
        noop="hostnames are set",
        name="Set hostname",
        _sudo=True,
    )
