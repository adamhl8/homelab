#!/usr/bin/env python

from shellrunner import X


def main():
    origin_branch = X(
        "git remote show origin | awk '/HEAD branch/ {print $NF}'",
        show_commands=False,
        show_output=False,
    ).out
    X("git pull --rebase", show_commands=False)
    X(f"git fetch origin {origin_branch}", show_commands=False)
    X(f"git rebase origin/{origin_branch}", show_commands=False, check=False)


if __name__ == "__main__":
    main()
