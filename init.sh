#!/bin/bash

if type sudo &>/dev/null; then
  sudo apt update
  sudo apt install python3 python3-pip python-is-python3 -y
else
  apt update
  apt install python3 python3-pip python-is-python3 -y
fi
