#!/usr/bin/env python

import subprocess
import os

# Get full path of parent process/shell
ppid = os.getppid()
process = subprocess.run(f'readlink /proc/{ppid}/exe', shell=True, capture_output=True, check=True, text=True)
shell_path = process.stdout.strip()
shell_name = os.path.basename(shell_path)
isFish = shell_name == 'fish'

def X(command: str, check: bool=True, pipefail=True) -> str:

  print(f'Executing: {command}')

  # ⽌ = U+2F4C
  if isFish: command = f'{command}; echo ⽌FISH_PIPESTATUS: $pipestatus;'

  returncode = None
  pipestatus = ''
  output = ''

  with subprocess.Popen(
    command,
    shell=True,
    executable=shell_path,
    text=True,
    bufsize=1,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
  ) as process:
    while (out := process.stdout.read(1)) or process.poll() is None:
      if out.startswith('⽌'): pipestatus = 'done'
      if not pipestatus:
        print(out, end='', flush=True)
        output += out
      else: pipestatus += out
    returncode = process.wait()

  if pipestatus: pipestatus = pipestatus.split(': ')[1]

  if check and returncode != 0: raise ChildProcessError(returncode)
  if pipefail and isFish and pipestatus:
    # get pipestatus as list: '0 1 0' -> [0, 1, 0]
    pipestatus = [int(x) for x in pipestatus.split()]
    for status in pipestatus:
      if status != 0: raise ChildProcessError(f'Pipefail {pipestatus}')

  return (output, returncode)
