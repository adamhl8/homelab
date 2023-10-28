from shellrunner import X


def reboot() -> bool:
    response = input("Reboot? [y/N] ")
    if response.lower() == "y":
        X("sudo reboot")
        return True
    return False


def continuep() -> bool:
    response = input("Continue? [Y/n] ")
    return response.lower() != "n"
