#!/bin/bash

if type sudo &>/dev/null; then
  sudo apt update
  sudo apt install python3 python3-pip python3-venv python-is-python3 -y
  pip install -U python-shellrunner
  sudo apt install curl -y
else
  apt update
  apt install python3 python3-pip python3-venv python-is-python3 -y
  pip install -U python-shellrunner
  apt install curl -y
fi
