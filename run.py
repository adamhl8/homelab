#!/usr/bin/env python

import importlib
import inspect
import sys
from shutil import which

import hl_helpers as helpers
import hl_prompts as prompts
from shellrunner import X


def main():
    name = sys.argv[1]
    node = importlib.import_module(f"nodes.{name}")
    steps = inspect.getmembers(node, inspect.isfunction)
    steps = [t for t in steps if inspect.getmodule(t[1]) == node]

    if which("sudo"):
        X("sudo -v")

    homelab_root = helpers.get_homelab_root()

    for step in steps:
        current_step, step_fn = step

        if (homelab_root / current_step).is_file():
            continue

        print(f"Running {name} {current_step}...")
        step_fn()

        (homelab_root / current_step).touch()
        print(f"{name} {current_step} complete.")

        if step == steps[-1]:
            print(f"Finished running {name}.")
            for file in homelab_root.glob("step*"):
                file.unlink()

        if not prompts.reboot():
            sys.exit(0)


if __name__ == "__main__":
    main()
