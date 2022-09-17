#!/bin/bash

reboot_prompt() {
  read -p "Reboot? (Y/n) " -n 1 -r reply
  echo
  if [[ ! ${reply} =~ ^[Nn]$ ]]; then sudo reboot; else exit; fi
}

continue_prompt() {
  read -p "Continue? (Y/n) " -n 1 -r reply
  echo
  [[ ${reply} =~ ^[Nn]$ ]] && exit
}
