import shlex
from itertools import starmap
from typing import TYPE_CHECKING

from lib.operations.converge import converge

if TYPE_CHECKING:
    from collections.abc import Mapping, Sequence

type Scalar = bool | int | float | str

_LS_DOMAIN = "com.apple.LaunchServices/com.apple.launchservices.secure"


def _read(domain: str, key: str) -> str:
    return f"defaults read {shlex.quote(domain)} {shlex.quote(key)} 2>/dev/null"


def _expected(value: Scalar) -> str:
    # defaults read prints booleans as 1/0
    return ("1" if value else "0") if isinstance(value, bool) else str(value)


def _check(domain: str, key: str, value: Scalar) -> str:
    return f'[ "$({_read(domain, key)})" = {shlex.quote(_expected(value))} ]'


def _write(domain: str, key: str, value: Scalar) -> str:
    if isinstance(value, bool):
        flag, out = "-bool", str(value).lower()
    elif isinstance(value, int):
        flag, out = "-int", str(value)
    elif isinstance(value, float):
        flag, out = "-float", str(value)
    else:
        flag, out = "-string", value
    return f"defaults write {shlex.quote(domain)} {shlex.quote(key)} {flag} {shlex.quote(out)}"


def _handler_check(content_type: str, handler: str) -> str:
    read = f"defaults read {_LS_DOMAIN} LSHandlers 2>/dev/null"
    # lsd inserts keys between ContentType and RoleAll after registration, hence the -A8 window
    ct_line = shlex.quote(f'LSHandlerContentType = "{content_type}";')
    return f"{read} | grep -A8 {ct_line} | grep -qi {shlex.quote(handler)}"


def _handler_fix(content_type: str, handler: str) -> str:
    entry = shlex.quote(f'{{LSHandlerContentType="{content_type}";LSHandlerRoleAll="{handler}";}}')
    add = f"defaults write {_LS_DOMAIN} LSHandlers -array-add {entry}"
    # -array-add is not idempotent, so re-check in case only some other key drifted
    return f"{{ {_handler_check(content_type, handler)} || {add}; }}"


def macos_defaults(
    settings: dict[str, dict[str, Scalar]],
    handlers: Mapping[str, str] | None = None,
    kill: Sequence[str] = (),
) -> None:
    """Converge `defaults` keys to the declared values, restarting the apps in kill.

    handlers maps a UTI (e.g. "public.folder") to the bundle id that should open it,
    as a LaunchServices LSHandlers entry. Find keys at https://macos-defaults.com
    or with `just defaults-diff`.
    """
    pairs = [(d, k, v) for d, keys in settings.items() for k, v in keys.items()]
    hpairs = list((handlers or {}).items())
    kills = [f"{{ killall {shlex.quote(p)} 2>/dev/null || true; }}" for p in kill]
    observe = "printf '%s\\n' " + " ".join(
        [f'"{d} {k} $({_read(d, k)})"' for d, k, _ in pairs]
        + [
            f'"handler {ct} $({{ {_handler_check(ct, h)}; }}'
            f' && echo {shlex.quote(h)} || echo missing)"'
            for ct, h in hpairs
        ]
    )
    desired = "\n".join(
        [f"{d} {k} {_expected(v)}" for d, k, v in pairs] + [f"handler {ct} {h}" for ct, h in hpairs]
    )
    converge(
        check=" && ".join(list(starmap(_check, pairs)) + list(starmap(_handler_check, hpairs))),
        fix=" && ".join(list(starmap(_write, pairs)) + list(starmap(_handler_fix, hpairs)) + kills),
        noop="defaults are set",
        name="Apply macOS defaults",
        diff=(observe, desired),
    )
