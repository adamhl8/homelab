from shellrunner import X


def main():
    import hl_helpers as helpers

    os_name = helpers.get_os_name()

    X("sudo apt install ca-certificates curl gnupg lsb-release -y")
    X("sudo mkdir -p /etc/apt/keyrings")
    X(
        f"curl -fsSL https://download.docker.com/linux/{os_name}/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
    )
    X(
        f"""echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/{os_name} $(lsb_release -cs | string replace bookworm bullseye) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null""",
    )
    X("sudo apt update")
    X("sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y")
    X("sudo usermod -aG docker $USER")


def login():
    X(
        """sops -d --extract "['github_ghcr_token']" ~/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )