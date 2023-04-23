def main():
    import hl_helpers as helpers
    from shellrunner import X

    paths = helpers.homelab_paths

    X("brew install sops")

    X(f"ln -f -s {paths.secrets_yaml} ~/")

    X("mkdir -p ~/.config/sops/age/")
    print("Enter key.age passphrase")
    X(f"age -o ~/.config/sops/age/keys.txt -d {paths.age_key}")
    X("chmod 600 ~/.config/sops/age/keys.txt")
