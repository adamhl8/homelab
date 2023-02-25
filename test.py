#!/usr/bin/env python

import subprocess
import os

# Get full path of parent process/shell
ppid = os.getppid()
process = subprocess.run(f'readlink /proc/{ppid}/exe', shell=True, capture_output=True, check=True, text=True)
shell_path = process.stdout.strip()
shell_name = os.path.basename(shell_path)

def X(command: str) -> str:

  if shell_name == 'fish': command = f'{command}; echo $pipestatus'

  process = subprocess.Popen(
    command,
    shell=True,
    executable=shell_path,
    text=True,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
  )

  stdout, stderr = process.communicate()
  returncode = process.returncode

  if shell_name == 'fish':
    pipestatus = stdout.splitlines()[-1]
  

  if stdout and not stdout.isspace(): print(stdout)
  if stderr and not stderr.isspace(): print(stderr)

  if returncode != 0: raise ChildProcessError(returncode)

  return (stdout, stderr, returncode)

X('echo test')
X('echo hello | grep 1 | echo bye')
