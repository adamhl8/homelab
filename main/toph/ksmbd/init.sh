#!/bin/bash

sudo apt install ksmbd-tools -y

sudo mkdir /etc/ksmbd
sudo ksmbd.adduser -a adam

sudo ln -s ~/ksmbd/smb.conf /etc/ksmbd/

sudo systemctl daemon-reload
sudo systemctl reload ksmbd