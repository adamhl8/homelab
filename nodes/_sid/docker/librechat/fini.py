from time import sleep

from shellrunner import X


def main() -> None:
    print("Waiting for LibreChat to start...")
    sleep(5)

    homelab_password = X("""sops -d --extract '["homelab_password"]' ~/secrets.yaml""", show_output=False).out
    print("Creating LibreChat user...")
    X(
        f"docker exec librechat ash -c 'npm run create-user adamhl@pm.me Adam adam {homelab_password}'",
        show_command=False,
        show_output=False,
    )


if __name__ == "__main__":
    main()
