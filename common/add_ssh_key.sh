#!/bin/bash

mkdir ~/.ssh/
chmod 700 ~/.ssh/
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFPbjkzm8d73AQxOZ/CqmYXRydfMXgYxOEIsPHa6rDDO' | tee -a ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys