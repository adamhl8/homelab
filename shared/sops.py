def main():
    import hl_helpers as helpers
    from shellrunner import X

    paths = helpers.homelab_paths

    X(
        f'curl -s https://api.github.com/repos/mozilla/sops/releases/latest | string match -r "https://.*/download/.*sops.*linux.{helpers.get_arch()}" | sed 1q | xargs curl -Lo ~/bin/sops',
    )
    X("chmod 755 ~/bin/sops")
    X(f"ln -s {paths.secrets_yaml} ~/")

    X("mkdir -p ~/.config/sops/age/")
    print("Enter key.age passphrase")
    X(f"age -o ~/.config/sops/age/keys.txt -d {paths.age_key}")
    X("chmod 600 ~/.config/sops/age/keys.txt")
