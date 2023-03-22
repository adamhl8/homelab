from shellrunner import X


def get_homelab_root():
    from pathlib import Path

    return Path(__file__).parent.parent.resolve(strict=True)


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
