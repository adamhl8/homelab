#!/usr/bin/env python

import argparse
import math
import subprocess
from pathlib import Path

video_extensions = [".mp4", ".m4v", ".mkv", ".flv", ".avi", ".mov", ".wmv"]


def prune(directory: Path, out_dir: Path, duration_cutoff: int) -> None:
    for file_path in directory.rglob("*"):
        if any(file_path.suffix.lower() == ext for ext in video_extensions):
            if duration_cutoff > 0:
                result = subprocess.run(
                    ["ffprobe", "-i", file_path, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"],  # noqa: S603, S607
                    capture_output=True,
                    text=True,
                    check=True,
                )
                duration = math.ceil(float(result.stdout.strip()))

                # If the duration is less than or equal to duration_cutoff, move the video to the out_dir/ignored
                if duration <= duration_cutoff:
                    ignored_dir = out_dir / "ignored"
                    ignored_dir.mkdir(parents=True, exist_ok=True)
                    file_path.rename(ignored_dir / file_path.name)
                    print(f"Ignored {file_path.relative_to(directory)} ({duration}s)")
                    continue

            player = subprocess.Popen(["vlc", str(file_path)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)  # noqa: S603, S607

            print(f"\n{file_path.name}")
            filename_input = ""
            while not filename_input:
                filename_input = input("Enter new filename to rename, 'd' to delete, or 's' to skip: ")

            player.terminate()
            while player.poll() is None:
                pass

            if filename_input.lower() == "d":
                file_path.unlink()
            elif filename_input.lower() == "s":
                continue
            else:
                relative_path = file_path.relative_to(directory)

                new_file_path = (out_dir / relative_path).with_stem(filename_input)
                new_file_path.parent.mkdir(parents=True, exist_ok=True)

                counter = 2
                while new_file_path.exists():
                    new_file_path = new_file_path.with_stem(f"{filename_input}_{counter}")
                    counter += 1

                file_path.rename(new_file_path)


def convert(directory: Path, out_dir: Path) -> None:
    for file_path in Path(directory).rglob("*"):
        if any(file_path.suffix.lower() == ext for ext in video_extensions):
            print(f"\n{file_path}")

            relative_path = file_path.relative_to(directory)

            out_file_path = out_dir / relative_path
            out_file_path.parent.mkdir(parents=True, exist_ok=True)

            out_file_path = out_file_path.with_suffix(".mp4")

            command = [
                "ffmpeg",
                "-i",
                f"{file_path}",
                "-c:v",
                "libx265",
                "-preset",
                "faster",
                "-crf",
                "26",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-movflags",
                "+faststart",
                "-sn",
                "-map_metadata",
                "-1",
                "-map_chapters",
                "-1",
                f"{out_file_path}",
            ]

            subprocess.run(command)  # noqa: S603, PLW1510


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument(
        "-o",
        "--out-dir",
        type=str,
        help="The directory to move completed files to",
        required=True,
        nargs="?",
    )
    common_parser.add_argument("directory", type=str, help="The directory containing videos", nargs="?")

    subparsers = parser.add_subparsers(dest="command")

    prune_parser = subparsers.add_parser("prune", parents=[common_parser], help="Delete unwanted videos")
    prune_parser.add_argument(
        "-d",
        "--duration",
        type=int,
        help="Videos with a duration less than or equal to the provided value will be ignored",
    )

    convert_parser = subparsers.add_parser("convert", parents=[common_parser], help="Convert videos")

    args = parser.parse_args()

    directory = Path(args.directory).resolve()
    out_dir = Path(args.out_dir).resolve()
    duration_cutoff = int(getattr(args, "duration", 0))

    if args.command == "prune":
        prune(directory, out_dir, duration_cutoff)
    elif args.command == "convert":
        convert(directory, out_dir)
