from shellrunner import X


def main() -> None:
    X("echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf")
    X("echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf")
    X("sudo sysctl -p /etc/sysctl.conf")

    # https://tailscale.com/kb/1320/performance-best-practices#linux-optimizations-for-subnet-routers-and-exit-nodes
    X(
        r"""set -l interface (ip route show 0/0 | cut -f5 -d ' '); echo -e "#!/bin/sh\n\n[ \"\$1\" = \"$interface\" ] && ethtool -K $interface rx-udp-gro-forwarding on rx-gro-list off\n" | sudo tee /etc/NetworkManager/dispatcher.d/pre-up.d/50-tailscale >/dev/null"""  # noqa: E501
    )
    X("sudo chmod 755 /etc/NetworkManager/dispatcher.d/pre-up.d/50-tailscale")


if __name__ == "__main__":
    main()
