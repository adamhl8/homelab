#!/usr/bin/env python

from shellrunner import X


def main() -> None:
    X("git fetch -p", show_command=False)
    output = X("git branch -vv", show_command=False, show_output=False).out.splitlines()
    # If the currently checked out branch is gone, it will have a "*" prefix
    branches = [line.strip().removeprefix("* ").split()[0] for line in output if ": gone" in line]

    for line in branches:
        X(f"git branch -D {line}", show_command=False)


if __name__ == "__main__":
    main()
