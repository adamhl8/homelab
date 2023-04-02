def main():
    from shutil import which

    import hl_helpers as helpers
    from shellrunner import ShellCommandError, X

    paths = helpers.homelab_paths
    os_name = helpers.get_os_name()

    X("sudo mkdir -p /etc/apt/keyrings")

    if os_name == "debian":
        X(
            "curl -fsSL 'https://download.opensuse.org/repositories/shells:fish:release:3/Debian_11/Release.key' | sudo gpg --dearmor -o /etc/apt/keyrings/fish.gpg",
        )
        X(
            "echo 'deb [signed-by=/etc/apt/keyrings/fish.gpg] http://download.opensuse.org/repositories/shells:/fish:/release:/3/Debian_11/ /' | sudo tee /etc/apt/sources.list.d/fish.list > /dev/null",
        )
    elif os_name == "ubuntu":
        X(
            "curl -fsSL 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x59fda1ce1b84b3fad89366c027557f056dc33ca5' | sudo gpg --dearmor -o /etc/apt/keyrings/fish.gpg",
        )
        X(
            'echo "deb [signed-by=/etc/apt/keyrings/fish.gpg] https://ppa.launchpadcontent.net/fish-shell/release-3/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/fish.list > /dev/null',
        )
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

    X("mkdir -p ~/.config/fish/")
    X(f"ln -f -s {paths.configs.fish_config} ~/.config/fish/")
