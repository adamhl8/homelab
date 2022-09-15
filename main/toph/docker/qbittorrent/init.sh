sops exec-env ~/homelab/secrets.env 'tee ~/docker/qbittorrent/data/wg0.conf << EOF
[Interface]
# Key for qbittorrent
# NetShield = 0
# Moderate NAT = off
# VPN Accelerator = on
PrivateKey = ${qbittorrent_wireguard_key}
Address = 10.2.0.2/32
DNS = 10.2.0.1

[Peer]
# US-NY#38
PublicKey = 4Gjn941JfIDqDB3KWubQ4slUR362dUrgbT7WGvldPlM=
AllowedIPs = 0.0.0.0/0
Endpoint = 193.148.18.66:51820
EOF'