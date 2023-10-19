from hl_helpers import homelab_paths as paths
from shellrunner import X


def main():
    X("brew install sops")

    X(f"ln -f -s {paths.secrets_yaml} ~/")

    X("mkdir -p ~/.config/sops/age/")
    print("Enter key.age passphrase")
    X(f"age -o ~/.config/sops/age/keys.txt -d {paths.age_key}")
    X("chmod 600 ~/.config/sops/age/keys.txt")


if __name__ == "__main__":
    main()
