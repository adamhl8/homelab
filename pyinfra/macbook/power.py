from lib.operations.converge import converge

_AC = {"sleep": 0, "displaysleep": 10, "powermode": 2}
_BATTERY = {"displaysleep": 2, "powermode": 0}


def _get(section: str, key: str) -> str:
    return f"pmset -g custom | sed -n '{section}' | awk '$1==\"{key}\"{{print $2}}'"


def _ac_get(key: str) -> str:
    return _get("/AC Power:/,$p", key)


def _batt_get(key: str) -> str:
    return _get("/Battery Power:/,/AC Power:/p", key)


def power() -> None:
    """Converge pmset settings: AC never sleeps at high power, battery sleeps the display fast."""
    ac = " && ".join(f'[ "$({_ac_get(k)})" = {v} ]' for k, v in _AC.items())
    batt = " && ".join(f'[ "$({_batt_get(k)})" = {v} ]' for k, v in _BATTERY.items())
    observe = "printf '%s\\n' " + " ".join(
        [f'"ac {k} $({_ac_get(k)})"' for k in _AC]
        + [f'"battery {k} $({_batt_get(k)})"' for k in _BATTERY]
    )
    desired = "\n".join(
        [f"ac {k} {v}" for k, v in _AC.items()] + [f"battery {k} {v}" for k, v in _BATTERY.items()]
    )
    converge(
        check=f"{ac} && {batt}",
        fix=(
            "pmset -c "
            + " ".join(f"{k} {v}" for k, v in _AC.items())
            + " && pmset -b "
            + " ".join(f"{k} {v}" for k, v in _BATTERY.items())
        ),
        noop="power settings are set",
        name="Set power management",
        diff=(observe, desired),
        _sudo=True,
    )
