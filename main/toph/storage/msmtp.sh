#!/bin/bash

mkdir ~/msmtp/
sudo apt install msmtp -y
sudo apt install apparmor-utils -y
sudo aa-disable /etc/apparmor.d/usr.bin.msmtp

read -p "SMTP Password: " smtp_password
tee ~/msmtp/msmtp.conf << EOF
defaults
account adamhl.dev
account default : adamhl.dev
host email-smtp.us-east-1.amazonaws.com
port 587
tls on
auth on
user AKIAT5NKIWDOTLLLZ34R
password ${smtp_password}
from msmtp@adamhl.dev
EOF
chmod 600 ~/msmtp/msmtp.conf

tee ~/msmtp/restic-log << EOF
#!/bin/bash
sed -i '1iTo: adamhl@pm.me' ~/restic/restic.log
sed -i '2iFrom: msmtp@adamhl.dev' ~/restic/restic.log
sed -i '3iSubject: [restic-backup] ERROR' ~/restic/restic.log
msmtp -C ~/msmtp/msmtp.conf -t < ~/restic/restic.log
EOF
chmod 755 ~/msmtp/restic-log