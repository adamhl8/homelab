#!/usr/bin/env python

import sys
from shutil import which

from hl_helpers import Log, get_hostname, get_os, is_cwd_in_homelab_dir
from hl_helpers import homelab_paths as paths
from shellrunner import X

sys.path.append(f"{paths.root}")

from shared.fish_setup import install_rye_completions


def main() -> None:
    if is_cwd_in_homelab_dir():
        return

    os_name = get_os()
    hostname = get_hostname()

    X("sudo -v")

    X(f"homelab_root='{paths.root}' {paths.root / 'init/shared/shellrunner.bash'}", shell="bash")  # noqa: S604

    if os_name == "linux" and which("apt"):
        X("sudo apt update")
        X("sudo apt full-upgrade -y")
        X("sudo apt autoremove -y")

    X("brew update -f")
    if os_name == "linux":
        X("brew upgrade")
    else:
        X("brew upgrade -g --no-quarantine")
    X("brew autoremove")
    X("brew cleanup --prune=all -s")

    X("rye self update")
    install_rye_completions()
    X("rye toolchain fetch 3.12")

    if X("nvm --help", check=False, show_output=False, show_command=False).status == 0:
        X("nvm install latest")
        X("npm install -g npm")
        X("npm update -g")

    if which("pnpm"):
        X("pnpm add -g pnpm")
        X("pnpm install -g")
        X("pnpm update -g")

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

    Log.warn("System updated. Make sure to reboot.")


if __name__ == "__main__":
    main()
