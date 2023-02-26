#!/usr/bin/env python

import subprocess
import os

# Get full path of parent process/shell. That way commands are executed using the same shell that invoked this script.
ppid = os.getppid()
process = subprocess.run(f'readlink /proc/{ppid}/exe', shell=True, capture_output=True, check=True, text=True)
shell_path = process.stdout.strip()
shell_name = os.path.basename(shell_path)
isFish = shell_name == 'fish'

# If check=True (default), an error will be thrown on non-zero exit status.
# If pipefail=True (default), an error will be thrown on non-zero exit status of any command in a pipeline (only applies if using fish shell).
def X(command: str, check: bool=True, pipefail=True) -> str:

  print(f'Executing: {command}')

  # If command is to be executed using fish shell, append a command to get pipestatus.
  # We use "⽌" as a special character/marker (that we'll likely never come across in the wild) to detect when the given command has finished. 
  # This is necessary because stdout is read/printed on each character rather than by line. i.e. `out.startswith(FISH_PIPESTATUS)` will not work. See the subprocess while loop.
  if isFish: command = f'{command}; echo ⽌FISH_PIPESTATUS: $pipestatus;' # ⽌ = U+2F4C

  returncode = None
  pipestatus = ''
  output = ''

  # By using the Popen context manager via with, standard file descriptors are automatically closed.
  with subprocess.Popen(
    command,
    shell=True,
    executable=shell_path,
    text=True,
    bufsize=1,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
  ) as process:
    # If we are still receving output or poll() is None, we know the command is still running.
    # We must use stdout.read(1) rather than readline() in order to properly print commands that require input (e.g. read). We must also forcibly flush the stream in the print statement for the same reason.
    while (out := process.stdout.read(1)) or process.poll() is None:
      # If we detect our special character, we know the command has finished. Set pipestatus to a truthy value so the rest of the output is appended to pipestatus.
      if out.startswith('⽌'): pipestatus = 'done'
      if not pipestatus:
        print(out, end='', flush=True)
        output += out
      else: pipestatus += out
    returncode = process.wait()

  # Get $pipestatus from FISH_PIPESTATUS: $pipestatus
  if pipestatus: pipestatus = pipestatus.split(': ')[1]

  if check and returncode != 0: raise ChildProcessError(returncode)
  if pipefail and isFish and pipestatus:
    # Get pipestatus as list of ints: '0 1 0' -> [0, 1, 0]
    pipestatus = [int(x) for x in pipestatus.split()]
    for status in pipestatus:
      if status != 0: raise ChildProcessError(f'Pipefail {pipestatus}')

  return (output.strip(), returncode)
