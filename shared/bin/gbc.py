#!/usr/bin/env python

from shellrunner import X


def main():
    X("git fetch -p", show_commands=False)
    gone_list: list[str] = []
    branches = X("git branch -vv", show_commands=False, show_output=False).out.splitlines()
    for line in branches:
        if ": gone" in line:
            gone_list.append(line)

    branch_list: list[str] = []
    for branch in gone_list:
        branch_split = branch.split()
        if branch_split[0] == "*":
            branch_list.append(branch_split[1])
        else:
            branch_list.append(branch_split[0])

    for branch in branch_list:
        X(f"git branch -D {branch}", show_commands=False)


if __name__ == "__main__":
    main()