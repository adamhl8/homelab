import hl_helpers as helpers
from shellrunner import X

paths = helpers.homelab_paths

programs = [
    "bash",
    "coreutils",
    "diffutils",
    "findutils",
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
    "yq",
    "age",
]

def main():
    X(f"ln -s {paths.shared_bin} ~/")
    X(f"ln -s {paths.configs.git_config} ~/")

    for program in programs:
        X(f"brew install {program}")

    X(
        [
            f"cd {paths.root}",
            "git remote set-url origin git@github.com:(git remote get-url origin | string replace 'https://github.com/' '')",
        ],
    )
