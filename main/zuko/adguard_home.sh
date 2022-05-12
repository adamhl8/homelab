#!/bin/bash

curl -s -S -L https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/master/scripts/install.sh | sh -s -- -v

cat << EOF
  - Query logs retention: 24 hours
  - Upstream DNS: 
    - tls://1dot1dot1dot1.cloudflare-dns.com
    - [/lan/]192.168.1.1
  - Parallel requests
  - Bootstrap DNS:
    - 1.1.1.1
    - 1.0.0.1
  - Cache size: 10000000
  - Optimistic caching
EOF