from hl_helpers import homelab_paths as paths
from shellrunner import X

programs = [
    "bash",
    "coreutils",
    "diffutils",
    "findutils",
    "rsync",
    "grep",
    "gnu-sed",
    "gawk",
    "gnu-tar",
    "gzip",
    "zip",
    "unzip",
    "curl",
    "wget",
    "git",
    "htop",
    "micro",
    "fd",
    "fclones",
    "zoxide",
    "bat",
    "fzf",
    "jq",
    "yq",
    "xq",
    "age",
]


def main() -> None:
    X(f"ln -f -s {paths.shared_bin} ~/")
    X(f"ln -f -s {paths.configs.git_config} ~/")

    for program in programs:
        X(f"brew install {program}")

    X(
        [
            f"cd {paths.root}",
            "git remote set-url origin git@github.com:adamhl8/homelab.git",
        ],
    )

    X("rye install shell-gpt")


if __name__ == "__main__":
    main()
