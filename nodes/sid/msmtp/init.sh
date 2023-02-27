#!/bin/bash

sudo apt install msmtp -y
sudo apt install apparmor-utils -y
sudo aa-disable /etc/apparmor.d/usr.bin.msmtp
