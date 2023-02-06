#!/usr/bin/env fish

function reboot_prompt
  read -ln 1 -P "Reboot? (y/N) " input
  if string match -qi 'y' $input
    if type -q wsl.exe
      echo "WSL detected. Shutting down..."
      powershell.exe -Command wsl --shutdown
    else
      sudo reboot
    end
    return 0
  end
  return 1
end

function continue_prompt
  read -ln 1 -P "Continue? (Y/n) " input
  if string match -qi 'n' $input
    return 1
  end
  return 0
end

function password_prompt
  argparse -N 1 n/name -- $argv
  or return

  set -l name $argv[1]
  
  set -l password
  set -l confirmation
  
  function read_password -S
    read -s -P "Enter $(set_color -o yellow)$name$(set_color normal) password: " password
    read -s -P "Confirm password: " confirmation
  end

  read_password

  while test $password != $confirmation
    echo "Passwords do not match."
    read_password
  end

  echo $password
end
