#!/bin/bash

sudo apt install python3 python3-pip python-is-python3
sudo curl -Lo /usr/local/bin/zxpy https://raw.githubusercontent.com/tusharsadhwani/zxpy/master/zx.py
sudo chmod +x /usr/local/bin/zxpy
sudo chown "$(whoami):$(whoami)" /usr/local/bin/zxpy
sudo sed -i '1s|^|#!/usr/bin/env python\n|' /usr/local/bin/zxpy