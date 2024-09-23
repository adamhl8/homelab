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
    "bat",
    "fzf",
    "jq",
    "yq",
    "xq",
    "age",
    "eza",
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


if __name__ == "__main__":
    main()

"""
curl -fsSL 'https://raw.githubusercontent.com/eza-community/eza/main/deb.asc' | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list >/dev/null
sudo apt update
sudo apt install eza -y
"""

"""
if type batcat
ln -s -f /usr/bin/batcat ~/bin/bat
"""

"""
ln -s -f ~/homelab/shared/bin/docker-container-update.py ~/bin/
ln -s -f ~/homelab/shared/bin/system-update.py ~/bin/
"""
