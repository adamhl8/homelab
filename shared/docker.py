from hl_helpers import add_apt_source, get_distro, get_distro_version_name
from shellrunner import X


def main():
    X("sudo apt install ca-certificates curl gnupg -y")
    distro = get_distro()
    distro_version_name = get_distro_version_name().replace("bookworm", "bullseye")
    add_apt_source(
        name="docker",
        gpg_url=f"https://download.docker.com/linux/{distro}/gpg",
        source=f"https://download.docker.com/linux/{distro} {distro_version_name} stable",
    )
    X("sudo apt update")
    X("sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y")
    X("sudo usermod -aG docker $USER")


def login():
    X(
        """sops -d --extract "['github_ghcr_token']" ~/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )


if __name__ == "__main__":
    main()
