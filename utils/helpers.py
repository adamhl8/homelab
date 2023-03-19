import platform

from shellrunner import X

from run import COMMON, HOMELAB_ROOT


def get_arch():
    if platform.machine() == "aarch64":
        return "arm64"
    return "amd64"


def get_os_name():
    return X('cat /etc/os-release | grep ^ID= | sed "s|^ID=||"').out.strip()


def setup_pnpm():
    X("pnpm config set enable-pre-post-scripts=true")
    X("pnpm add -g npm-check-updates")
    X("pnpm login")


def add_user(user: str = "adam"):
    user_home = f"/home/{user}"

    X("apt install sudo")

    X(f"adduser {user}")
    X(f"usermod -aG sudo {user}")

    X(f"mkdir -p {user_home}/.ssh/")
    X(f"chmod 700 {user_home}/.ssh/")
    X(f"chown {user}:{user} {user_home}/.ssh/")
    X(f"cp -f {COMMON}/configs/authorized_keys {user_home}/.ssh/")
    X(f"chmod 600 {user_home}/.ssh/authorized_keys")
    X(f"chown {user}:{user} {user_home}/.ssh/authorized_keys")

    X(f"touch {HOMELAB_ROOT}/step1")
    X(f"cp -a {HOMELAB_ROOT}/ {user_home}/")
    X(f"chown -R {user}:{user} {user_home}/homelab")
