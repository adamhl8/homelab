from X import X
from shutil import which

def reboot():
  response = input('Reboot? (y/N) ')
  if response.lower() == 'y':
    if which('wsl.exe'):
      print('WSL detected. Shutting down...')
      X('powershell.exe -Command wsl --shutdown')
    else: X('sudo reboot')
  else: return False

def continuep():
  response = input('Continue? (Y/n) ')
  return not response.lower() == 'n'
