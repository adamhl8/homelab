def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("sudo apt install ksmbd-tools -y")
    X("sudo mkdir -p /etc/ksmbd")
    X("sudo ksmbd.adduser -a adam")
    X(f"sudo ln -s {paths.nodes.sid}/ksmbd/smb.conf /etc/ksmbd/")
    X("sudo systemctl daemon-reload")
    X("sudo systemctl reload ksmbd")
