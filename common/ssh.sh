#!/bin/bash

mkdir ~/.ssh/
chmod 700 ~/.ssh/
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFPbjkzm8d73AQxOZ/CqmYXRydfMXgYxOEIsPHa6rDDO' | tee -a ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# sshd config
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
