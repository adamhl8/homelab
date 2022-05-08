#!/bin/bash

reboot_prompt() {
  read -p "Reboot? (y/N) " -n 1 -r reply
  echo
  [[ ${reply} =~ ^[Yy]$ ]] && sudo reboot
}

continue_prompt() {
  read -p "Continue? "
  echo
}