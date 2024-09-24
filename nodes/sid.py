from hl_helpers import homelab_paths as paths
from hl_helpers import start_all_docker_containers
from shellrunner import X

from shared._modules import shared


def step1() -> None:
    shared.fish_install()


def step2() -> None:
    shared.fish_setup()
    shared.sudoers()
    shared.common()


def step3() -> None:
    shared.sops()
    shared.ssh()
    shared.sshd()
    shared.docker()


def step4() -> None:
    shared.docker.login()


def step5() -> None:
    X(f"ln -f -s {paths.nodes.sid}/docker/ ~/")
    start_all_docker_containers()


"""
sudo apt install nfs-common -y
mkdir -p ~/mnt/storage
echo 'truenas.lan:/mnt/nas/storage /home/adam/mnt/storage nfs _netdev,nofail,hard,noatime,nodiratime,rsize=1048576,wsize=1048576 0 0' | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -a
"""
