def main():
    from shutil import which

    from shellrunner import ShellCommandError, X

    from utils import helpers

    os_name = helpers.get_os_name()

    if os_name == "debian":
        X(
            """echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /' | sudo tee /etc/apt/sources.list.d/shells:fish:release:3.list""",
        )
        X(
            """curl -fsSL https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/shells_fish_release_3.gpg > /dev/null""",
        )
    elif os_name == "ubuntu":
        X("sudo apt-add-repository ppa:fish-shell/release-3")
    else:
        message = f"Could not match OS: {os_name}"
        raise RuntimeError(message)

    X("sudo apt update")
    X("sudo apt install fish -y")

    fish_path = which("fish")
    try:
        X("grep -q fish /etc/shells")
    except ShellCommandError:
        X(f"echo {fish_path} | sudo tee -a /etc/shells > /dev/null")
        print(f"Added {fish_path} to /etc/shells")

    X(f"chsh -s {fish_path}")
    print(f"Set {fish_path} as default shell")
