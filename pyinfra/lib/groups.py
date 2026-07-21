from pathlib import Path

from pyinfra import host


def require_group(deploy_file: str) -> None:
    """Raise an error when the deploy targets a host that is not in the deploy's group.

    Call this with __file__ at the top of a deploy so it dies before any operation on a
    wrongly-targeted host.

    Running pyinfra without --limit runs a deploy file against every inventory host.
    """
    group = Path(deploy_file).resolve().parent.name
    if group not in host.groups:
        msg = f"{group}/deploy.py targets the {group} group - run `just apply {group}`"
        raise ValueError(msg)
