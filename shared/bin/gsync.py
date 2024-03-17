#!/usr/bin/env python

from shellrunner import X


def main() -> None:
    origin_branch = X(
        "git remote show origin | awk '/HEAD branch/ {print $NF}'",
        show_command=False,
        show_output=False,
    ).out
    X("git pull --rebase", show_command=False)
    X(f"git fetch origin {origin_branch}", show_command=False)
    X(f"git rebase origin/{origin_branch}", show_command=False, check=False)


if __name__ == "__main__":
    main()
