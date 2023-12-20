#!/usr/bin/env python

from shellrunner import X


def main() -> None:
    X("git fetch -p", show_command=False)
    branches = X("git branch -vv", show_command=False, show_output=False).out.splitlines()
    gone_list = [line for line in branches if ": gone" in line]

    branch_list: list[str] = []
    for branch in gone_list:
        branch_split = branch.split()
        if branch_split[0] == "*":
            branch_list.append(branch_split[1])
        else:
            branch_list.append(branch_split[0])

    for branch in branch_list:
        X(f"git branch -D {branch}", show_command=False)


if __name__ == "__main__":
    main()
