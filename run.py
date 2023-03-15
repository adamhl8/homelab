#!/usr/bin/env python

import importlib
import inspect
import sys
from pathlib import Path
from shutil import which

from shellrunner import X

from utils import prompts

name = sys.argv[1]

HOMELAB_ROOT = Path(sys.argv[0]).parent.absolute()
COMMON = HOMELAB_ROOT / "common"
MODULES = HOMELAB_ROOT / "nodes" / f"{name}"


def main():
    node = importlib.import_module(f"nodes.{name}")
    steps = inspect.getmembers(node, inspect.isfunction)
    steps = [t for t in steps if inspect.getmodule(t[1]) == node]

    if which("sudo"):
        X("sudo -v")

    for step in steps:
        current_step, step_fn = step

        if (HOMELAB_ROOT / current_step).is_file():
            continue

        print(f"Running {name} {current_step}...")
        step_fn()

        (HOMELAB_ROOT / current_step).touch()
        print(f"{name} {current_step} complete.")

        if step == steps[-1]:
            print(f"Finished running {name}.")
            for file in HOMELAB_ROOT.glob("step*"):
                file.unlink()

        if not prompts.reboot():
            sys.exit(0)


if __name__ == "__main__":
    main()
