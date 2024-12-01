from shellrunner import X


def main() -> None:
    X(r"""sudo sed -i -r '\|Defaults\s+env_reset|a Defaults\tenv_keep += "PATH EDITOR"' /etc/sudoers""")
    X(r"sudo sed -i -r 's|(Defaults\s+secure_path.+)|# \1|' /etc/sudoers")
    X(r'echo -e "ALL\tALL=(ALL) NOPASSWD: ALL" | sudo tee -a /etc/sudoers > /dev/null')


if __name__ == "__main__":
    main()

