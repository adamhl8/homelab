import platform

def get_arch():
  arch = 'amd64'
  if platform.machine() == 'aarch64': arch = 'arm64'
  return arch