import shlex

from lib.operations.converge import converge


def bun_globals(*packages: str) -> None:
    """Converge bun -g to exactly the given packages, removing extras."""
    names = sorted(packages)
    declared = " ".join(shlex.quote(p) for p in names)
    expected = shlex.quote("\n".join(names))
    # bun pm ls -g prints "├── name@version" under a header line, strip the trailing @version
    installed = "bun pm ls -g 2>/dev/null | awk 'NR>1{print $2}' | sed 's/@[^@]*$//' | sort"
    keep = " ".join(f"-e {shlex.quote(p)}" for p in names)
    converge(
        check=f'[ "$({installed})" = {expected} ]',
        fix=(
            f"bun add -g {declared} && "
            f'extras="$({installed} | grep -Fvx {keep})"; '
            f'[ -z "$extras" ] || printf \'%s\\n\' "$extras" | xargs -n1 bun remove -g'
        ),
        noop="bun globals are synced",
        name="Sync bun global packages",
        diff=(installed, "\n".join(names)),
    )
