#!/bin/bash

sudo apt install ksmbd-tools -y

sudo mkdir /etc/ksmbd
sudo ksmbd.adduser -a adam

sudo tee /etc/ksmbd/smb.conf << EOF
[global]
	server string = toph-smb
	netbios name = toph-smb

[storage]
	comment = Storage
	path = /mnt/storage/
	writable = yes
EOF

sudo systemctl daemon-reload
sudo systemctl reload ksmbd