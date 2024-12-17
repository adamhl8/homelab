from hl_helpers import homelab_paths as paths
from hl_helpers import start_all_docker_containers
from shared._modules import shared
from shellrunner import X


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


# systemctl list-units -t mount
"""
sudo sed -i -r 's|(After=.+)|\1 home-adam-mnt-taildrive.mount|' /lib/systemd/system/docker.service
sudo sed -i -r 's|(Requires=.+)|\1 home-adam-mnt-taildrive.mount|' /lib/systemd/system/docker.service
sudo systemctl daemon-reload
sudo systemctl restart docker
"""

"""
curl -fsSL https://tailscale.com/install.sh | sh
sudo apt install davfs2
mkdir -p ~/mnt/taildrive
echo '/home/adam/mnt/taildrive "" ""' | sudo tee -a /etc/davfs2/secrets >/dev/null
echo 'use_locks 0' | sudo tee -a /etc/davfs2/davfs2.conf >/dev/null

echo 'http://100.100.100.100:8080 /home/adam/mnt/taildrive davfs _netdev,rw,user,uid=1000,gid=1000 0 0' | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
sudo mount -av

ln -f -s ~/mnt/taildrive/adamhl8.github/pve-tailscale/storage/ ~/mnt/
"""
