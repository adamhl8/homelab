from time import sleep

from shellrunner import X


def main() -> None:
    print("Waiting for Syncthing to start...")
    sleep(5)
    # Set insecureAdminAccess
    X(
        r"sed -i '\|<address>127\.0\.0\.1.*</address>|a\        <insecureAdminAccess>true</insecureAdminAccess>' ~/docker/syncthing/data/config/config.xml",  # noqa: E501
    )
    X("docker restart syncthing")


if __name__ == "__main__":
    main()
