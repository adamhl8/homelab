from shellrunner import X


def main() -> None:
    X("echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf")
    X("echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf")
    X("sudo sysctl -p /etc/sysctl.conf")

    # https://tailscale.com/kb/1320/performance-best-practices#linux-optimizations-for-subnet-routers-and-exit-nodes
    X(
        r"""set -l interface (ip route show 0/0 | cut -f5 -d ' '); sudo sed -i "\|iface $interface|a \\\tpre-up /sbin/ethtool -K $interface rx-udp-gro-forwarding on rx-gro-list off" /etc/network/interfaces"""  # noqa: E501
    )


if __name__ == "__main__":
    main()
