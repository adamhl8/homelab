from hl_helpers import add_apt_source, get_distro, get_distro_version_name
from shellrunner import X


def main() -> None:
    X("sudo apt install ca-certificates curl -y")
    distro = get_distro()
    distro_version_name = get_distro_version_name()
    add_apt_source(
        name="docker",
        gpg_url=f"https://download.docker.com/linux/{distro}/gpg",
        source=f"https://download.docker.com/linux/{distro} {distro_version_name} stable",
    )
    X("sudo apt update")
    X("sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y")
    X("sudo usermod -aG docker $USER")


def login() -> None:
    X("""sops -d --extract "['github_ghcr_token']" ~/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""")


if __name__ == "__main__":
    main()

"""
curl -fsSL 'https://download.docker.com/linux/debian/gpg' | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install fish -y
"""
