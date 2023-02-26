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

  if isFish: command = f'{command}; echo FISH_PIPESTATUS: $pipestatus;'

  returncode = None
  pipestatus = None
  output = ""

  with subprocess.Popen(
    command,
    shell=True,
    executable=shell_path,
    text=True,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT
  ) as process:
    for line in process.stdout:
      done = line.startswith('FISH_PIPESTATUS')
      if not done:
        print(line, end='')
        output += line
      else: pipestatus = line.split(': ')[1]
    returncode = process.wait()

  if check and returncode != 0: raise ChildProcessError(returncode)
  if pipefail and isFish:
    # get pipestatus as list: '0 1 0' -> [0, 1, 0]
    pipestatus = [int(x) for x in pipestatus.split()]
    for status in pipestatus:
      if status != 0: raise ChildProcessError(f'Pipefail {pipestatus}')

  return (output, returncode)
