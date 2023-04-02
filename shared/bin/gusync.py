#!/usr/bin/env python

from shellrunner import X


def main():
    upstream_branch = X(
        "git remote show upstream | awk '/HEAD branch/ {print $NF}'",
        show_commands=False,
        show_output=False,
    ).out
    X("git pull --rebase", show_commands=False)
    X(f"git fetch upstream {upstream_branch}", show_commands=False)
    X(f"git rebase upstream/{upstream_branch}", show_commands=False)


if __name__ == "__main__":
    main()
