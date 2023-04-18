def main():
    import hl_helpers as helpers
    from shellrunner import X

    os = helpers.get_os()

    if os == "linux":
        X(f'curl -Lo ~/age.tar.gz "https://dl.filippo.io/age/latest?for=linux/{helpers.get_arch()}"')
        X(["cd ~/", "tar -vxzf ~/age.tar.gz"])
        X("mv ~/age/age* ~/bin/")
        X("chmod 755 ~/bin/age*")
        X("rm ~/age.tar.gz")
        X("rm -rf ~/age/")
    elif os == "macos":
        X("brew install age")
