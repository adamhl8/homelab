import platform
import re
import socket
from pathlib import Path
from typing import Literal, NamedTuple

from shellrunner import ShellCommandError, X

homelab_root = Path(__file__).parent.parent.resolve(strict=True)


class Configs(NamedTuple):
    configs_dir = homelab_root / "shared/configs"
    git_config = configs_dir / ".gitconfig"
    wezterm_config = configs_dir / ".wezterm.lua"
    authorized_keys = configs_dir / "authorized_keys"
    fish_config = configs_dir / "config.fish"
    micro_bindings = configs_dir / "micro_bindings.json"
    sshd_config = configs_dir / "sshd_config"


class Nodes(NamedTuple):
    nodes_dir = homelab_root / "nodes"
    adguard = nodes_dir / "_adguard"
    macbook = nodes_dir / "_macbook"
    pi = nodes_dir / "_pi"
    pve = nodes_dir / "_pve"
    sid = nodes_dir / "_sid"


class HomelabPaths(NamedTuple):
    root = homelab_root
    shared = homelab_root / "shared"
    shared_bin = shared / "bin"
    age_key = homelab_root / "key.age"
    secrets_yaml = homelab_root / "secrets.yaml"
    ssh_yaml = homelab_root / "ssh.yaml"
    caddyfile = Nodes.sid / "docker/caddy/Caddyfile"
    configs = Configs()
    nodes = Nodes()


homelab_paths = HomelabPaths()


def is_cwd_in_homelab_dir() -> bool:
    cwd = Path.cwd().resolve(strict=True)

    if homelab_paths.root in cwd.parents or homelab_paths.root == cwd:
        print(
            "Do not run this script from the homelab directory, or else the local python (venv) install will be used."
        )
        return True
    return False


def get_arch() -> Literal["amd64", "arm64"]:
    arch = platform.machine().lower()
    if arch == "amd64":
        return "amd64"
    if arch in ["aarch64", "arm64"]:
        return "arm64"
    message = f"Failed to resolve an expected arch. Got '{arch}'."
    raise RuntimeError(message)


def get_os() -> Literal["linux", "macos"]:
    os = platform.system().lower()
    if os == "linux":
        return "linux"
    if os == "darwin":
        return "macos"
    message = f"Failed to resolve an expected OS. Got '{os}'."
    raise RuntimeError(message)


def get_distro() -> str:
    try:
        return X('cat /etc/os-release | grep ^ID= | sed "s|^ID=||"').out
    except ShellCommandError as e:
        message = f"Failed to resolve distro. Got '{e.out}'."
        raise RuntimeError(message) from e


def get_distro_version_name() -> str:
    try:
        return X('cat /etc/os-release | grep ^VERSION_CODENAME= | sed "s|^VERSION_CODENAME=||"').out
    except ShellCommandError as e:
        message = f"Failed to resolve distro version name. Got '{e.out}'."
        raise RuntimeError(message) from e


def get_hostname() -> str:
    return socket.gethostname()


def get_latest_github_release(
    repo: str, file_pattern: str, out_path: str, *, search_all_releases: bool = False
) -> Path:
    latest = "/latest" if not search_all_releases else ""
    releases = X(f"curl -s https://api.github.com/repos/{repo}/releases{latest}", show_output=False).out
    match = re.search(rf"https://.*/download/.*{file_pattern}", releases)
    if match is None:
        message = f"Failed to find match for pattern: {file_pattern}"
        raise RuntimeError(message)
    download_url = match.group(0)
    X(f"curl -Lo {out_path} {download_url}")
    return Path(out_path).expanduser().resolve(strict=True)


def send_email(*, from_addr: str, to_addr: str, subject: str, body: str) -> None:
    import smtplib
    import ssl
    from email.message import EmailMessage

    message = EmailMessage()
    message["From"] = from_addr
    message["To"] = to_addr
    message["Subject"] = subject
    message.set_content(body)

    aws_access_key_id = X("""sops -d --extract "['aws_access_key_id']" ~/secrets.yaml""", show_output=False).out
    smtp_password = X("""sops -d --extract "['smtp_password']" ~/secrets.yaml""", show_output=False).out

    client = smtplib.SMTP(host="email-smtp.us-east-1.amazonaws.com", port=587)
    ctx = ssl.create_default_context()
    ctx.verify_mode = ssl.CERT_REQUIRED
    client.starttls(context=ctx)
    client.login(aws_access_key_id, smtp_password)
    client.send_message(message)
    client.quit()


def generate_docker_env(keys: list[str], file_str: str) -> None:
    output = ""
    for key in keys:
        secret = X(f"""sops -d --extract "['{key}']" ~/secrets.yaml""", show_output=False, show_command=False).out
        output += f"{key}='{secret}'\n"
    (Path(file_str).parent.resolve(strict=True) / ".env").write_text(output)


def substitute_vars(file_path: str, var_names: list[str]) -> None:
    for var_name in var_names:
        X(
            f"""cat {file_path} | string replace '${{{var_name}}}' (sops -d --extract "['{var_name}']" ~/secrets.yaml) | tee {file_path} >/dev/null"""  # noqa: E501
        )


def start_all_docker_containers() -> None:
    for d in sorted((Path.home() / "docker").glob("*")):
        if (d / "init.py").is_file():
            X(f"python {d / 'init.py'}")

        X([f"cd {d}", "docker compose up -d"])

        if (d / "fini.py").is_file():
            X(f"python {d / 'fini.py'}")


def add_apt_source(*, name: str, gpg_url: str, source: str, arch: str = 'arch="$(dpkg --print-architecture)" ') -> None:
    X("sudo mkdir -p /etc/apt/keyrings")

    X(f"curl -fsSL '{gpg_url}' | sudo gpg --dearmor -o /etc/apt/keyrings/{name}.gpg")
    X(
        f'echo "deb [{arch}signed-by=/etc/apt/keyrings/{name}.gpg] {source}" | sudo tee /etc/apt/sources.list.d/{name}.list >/dev/null'  # noqa: E501
    )


class Colors:
    BLACK = "\033[90m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    RESET = "\033[0m"


# ruff: noqa: D102


class Color:
    @staticmethod
    def error(message: str) -> str:
        return f"{Colors.RED}{message}{Colors.RESET}"

    @staticmethod
    def warn(message: str) -> str:
        return f"{Colors.YELLOW}{message}{Colors.RESET}"

    @staticmethod
    def info(message: str) -> str:
        return f"{Colors.BLUE}{message}{Colors.RESET}"

    @staticmethod
    def notice(message: str) -> str:
        return f"{Colors.MAGENTA}{message}{Colors.RESET}"

    @staticmethod
    def success(message: str) -> str:
        return f"{Colors.GREEN}{message}{Colors.RESET}"


class Log:
    @staticmethod
    def error(message: str) -> None:
        print(Color.error(message))

    @staticmethod
    def warn(message: str) -> None:
        print(Color.warn(message))

    @staticmethod
    def info(message: str) -> None:
        print(Color.info(message))

    @staticmethod
    def notice(message: str) -> None:
        print(Color.notice(message))

    @staticmethod
    def success(message: str) -> None:
        print(Color.success(message))
