from shutil import which

from shellrunner import X


def reboot():
    response = input("Reboot? (y/N) ")
    if response.lower() == "y":
        if which("wsl.exe"):
            print("WSL detected. Shutting down...")
            X("powershell.exe -Command wsl --shutdown")
        else:
            X("sudo reboot")
    return False


def continuep():
    response = input("Continue? (Y/n) ")
    return response.lower() != "n"
