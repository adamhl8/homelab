#!/usr/bin/env python

import re
import sys
from shutil import which

from hl_helpers import Log, get_hostname, get_os, is_cwd_in_homelab_dir
from hl_helpers import homelab_paths as paths
from shellrunner import X

sys.path.append(f"{paths.root}")

from shared.fish_setup import install_rye_completions


def uninstall_old_node_versions() -> None:
    versions = X("nvm list", show_output=False).out.splitlines()
    old_versions: list[str] = []
    for version in versions:
        match = re.search(r"(v.+)\s", version)
        if match and "latest" not in version:
            old_versions.append(match.group(1))
    for version in old_versions:
        X(f"nvm uninstall {version}", show_command=False)


def main() -> None:  # noqa: C901
    if is_cwd_in_homelab_dir():
        return

    os_name = get_os()
    hostname = get_hostname()

    X("sudo -v")

    X("rye self update")
    install_rye_completions()
    X("rye toolchain fetch 3.12")

    X(f"homelab_root='{paths.root}' {paths.root / 'init/shared/shellrunner.bash'}", shell="bash")  # noqa: S604

    X("rye install shell-gpt -f")

    if os_name == "linux" and which("apt"):
        X("sudo apt update")
        X("sudo apt full-upgrade -y")
        X("sudo apt autoremove -y")

    if which("brew"):
        X("brew update -f")
        if os_name == "linux":
            X("brew upgrade")
        else:
            X("brew upgrade -g --no-quarantine")
        X("brew autoremove")
        X("brew cleanup --prune=all -s")

    if X("nvm --help", check=False, show_output=False, show_command=False).status == 0:
        X("nvm install latest")
        uninstall_old_node_versions()
        X("npm install -g npm")
        X("npm update -g")

    if which("bun"):
        X("bun update -g -f")

    X("fisher update")

    if which("sdk"):
        X("sdk selfupdate")
        X("sdk update")

    if hostname == "sid":
        from nodes._sid.bin.mergerfs_update import main as mergerfs_update
        from nodes._sid.bin.snapraid_btrfs_runner_update import main as snapraid_btrfs_runner_update
        from nodes._sid.bin.snapraid_btrfs_update import main as snapraid_btrfs_update
        from nodes._sid.bin.snapraid_update import main as snapraid_update

        X("~/restic/restic self-update")
        mergerfs_update()
        snapraid_btrfs_runner_update()
        snapraid_btrfs_update()
        snapraid_update()
        X("docker-container-update.py")

    if hostname == "adguard":
        X("~/AdGuardHome/AdGuardHome --update")

    if hostname == "pi":
        X("docker-container-update.py")

    Log.warn("System updated. Make sure to reboot.")


if __name__ == "__main__":
    main()
