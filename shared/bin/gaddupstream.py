#!/usr/bin/env python

from hl_helpers import warn
from shellrunner import ShellCommandError, X


def main():
    url = X("git remote get-url origin", show_commands=False, show_output=False).out
    repo = url.split(":")[1].removesuffix(".git")
    parent_repo = X(
        f"curl -s 'https://api.github.com/repos/{repo}' | yq '.parent.clone_url'",
        show_commands=False,
        show_output=False,
    ).out
    if parent_repo != "null":
        try:
            X(f"git remote add upstream {parent_repo}", show_commands=False, show_output=False)
            print(f"Added upstream: {parent_repo}")
        except ShellCommandError as e:
            if "remote upstream already exists" in e.out:
                print(e.out)
            else:
                raise

    else:
        warn("No upstream found.")


if __name__ == "__main__":
    main()