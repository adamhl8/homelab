from pathlib import Path
from typing import NamedTuple

from shellrunner import X

homelab_root = Path(__file__).parent.parent.resolve(strict=True)


class Configs(NamedTuple):
    configs_dir = homelab_root / "shared/configs"
    git_config = configs_dir / ".gitconfig"
    authorized_keys = configs_dir / "authorized_keys"
    fish_config = configs_dir / "config.fish"
    sshd_config = configs_dir / "sshd_config"


class Nodes(NamedTuple):
    nodes_dir = homelab_root / "nodes"
    adguard = nodes_dir / "adguard"
    pi = nodes_dir / "pi"
    sid = nodes_dir / "sid"
    wsl = nodes_dir / "wsl"


class HomelabPaths(NamedTuple):
    root = homelab_root
    shared = homelab_root / "shared"
    shared_bin = shared / "bin"
    age_key = homelab_root / "key.age"
    secrets_yaml = homelab_root / "secrets.yaml"
    ssh_yaml = homelab_root / "ssh.yaml"
    configs = Configs()
    nodes = Nodes()


homelab_paths = HomelabPaths()


def get_arch():
    import platform

    if platform.machine() == "aarch64":
        return "arm64"
    return "amd64"


def get_os_name():
    return X('cat /etc/os-release | grep ^ID= | sed "s|^ID=||"').out


def send_email(*, from_addr: str, to_addr: str, subject: str, body: str):
    import smtplib
    import ssl
    from email.message import EmailMessage

    message = EmailMessage()
    message["From"] = from_addr
    message["To"] = to_addr
    message["Subject"] = subject
    message.set_content(body)

    client = smtplib.SMTP(host="email-smtp.us-east-1.amazonaws.com", port=587)
    client.starttls(context=ssl.create_default_context())
    client.login("AKIAT5NKIWDOTLLLZ34R", X("""sops -d --extract "['smtp_password']" ~/secrets.yaml""").out)
    client.send_message(message)
    client.quit()
