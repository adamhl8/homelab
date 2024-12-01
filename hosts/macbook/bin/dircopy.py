#!/usr/bin/env python

import argparse
from pathlib import Path


def dircopy(directory: Path, out_dir: Path) -> None:
    for path in directory.rglob("*"):
        if path.is_dir():
            relative_path = path.relative_to(directory.parent)
            (out_dir / relative_path).mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-o",
        "--out-dir",
        type=str,
        help="Where to create the directory structure",
        required=True,
        nargs="?",
    )
    parser.add_argument("directory", type=str, help="The directory structure to copy", nargs="?")

    args = parser.parse_args()

    directory = Path(args.directory).resolve(strict=True)
    out_dir = Path(args.out_dir).resolve()

    dircopy(directory, out_dir)
