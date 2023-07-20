def main():
    from hl_helpers import homelab_paths as paths
    from shellrunner import X

    X("sudo apt install samba samba-client -y")
    X(f"sudo ln -f -s {paths.nodes.sid}/smb/smb.conf /etc/samba/smb.conf")
    X("sudo smbpasswd -a adam")
    X("sudo systemctl restart smbd nmbd")


if __name__ == "__main__":
    main()
