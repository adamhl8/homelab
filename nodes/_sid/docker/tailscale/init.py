from shellrunner import X

X("echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf")
X("echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf")
X("sudo sysctl -p /etc/sysctl.conf")
