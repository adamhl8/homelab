from shellrunner import X

from run import COMMON

X(f"sudo ln -f -s {COMMON}/configs/sshd_config /etc/ssh/")
X("sudo systemctl restart ssh")
