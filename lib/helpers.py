from shellrunner import X


def get_arch():
    import platform

    if platform.machine() == "aarch64":
        return "arm64"
    return "amd64"


def get_os_name():
    return X('cat /etc/os-release | grep ^ID= | sed "s|^ID=||"').out


def setup_pnpm():
    X("pnpm config set enable-pre-post-scripts=true")
    X("pnpm add -g npm-check-updates")
    X("pnpm login")


def docker_login():
    X(
        """sops -d --extract "['github_ghcr_token']" ~/secrets.yaml | docker login ghcr.io -u adamhl8 --password-stdin""",
    )


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


def add_user(user: str = "adam"):
    from run import COMMON, HOMELAB_ROOT

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
