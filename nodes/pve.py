from hl_helpers import homelab_paths as paths
from shellrunner import X


def step1():
    X("apt install nginx")
    X("rm /etc/nginx/sites-enabled/default")
    X(f"ln -s {paths.nodes.pve}/proxmox.conf /etc/nginx/conf.d/proxmox.conf")
    X("nginx -t")
    X("systemctl restart nginx")

    X("mkdir /etc/systemd/system/nginx.service.d/")
    X(f"ln -s {paths.nodes.pve}/override.conf /etc/systemd/system/nginx.service.d/")
