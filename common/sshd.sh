#!/bin/bash

sudo sed -i "s|^#.*\(PermitRootLogin\).*|\1 no|" /etc/ssh/sshd_config
sudo sed -i "s|^#.*\(PermitEmptyPasswords\).*|\1 no|" /etc/ssh/sshd_config
sudo sed -i "s|^#.*\(PasswordAuthentication\).*|\1 no|" /etc/ssh/sshd_config
sudo sed -i "s|^#.*\(ChallengeResponseAuthentication\).*|\1 no|" /etc/ssh/sshd_config
sudo sed -i "s|^#.*\(MaxAuthTries\).*|\1 3|" /etc/ssh/sshd_config
sudo sed -i "s|^#.*\(ClientAliveInterval\).*|\1 600|" /etc/ssh/sshd_config

sudo systemctl restart sshd

# Check config
config_items="permitrootlogin|\
permitemptypasswords|\
passwordauthentication|\
challengeresponseauthentication|\
maxauthtries|\
clientaliveinterval"
sudo sshd -T | grep -E $config_items
ssh -1 localhost
