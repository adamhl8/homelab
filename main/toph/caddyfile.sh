#!/bin/bash

mkdir ~/caddy/

tee ~/caddy/Caddyfile << EOF
{
  order authenticate before respond
  order authorize before reverse_proxy

  security {
    local identity store localdb {
      realm local
      path /etc/caddy/users.json
    }
    
    authentication portal authportal {
      enable identity store localdb
      cookie domain adamhl.dev
      cookie lifetime 172800
      crypto default token lifetime 86400
      
      ui {
        links {
          "Portal Settings" /settings icon "las la-cog"
        }
      }
    }
    
    authorization policy admin_policy {
      set auth url https://auth.adamhl.dev
      allow roles authp/admin
    }
  }
}

*.adamhl.dev {
  @auth host auth.adamhl.dev
  handle @auth {
    authenticate with authportal
  }
  
  @unifi host unifi.adamhl.dev
  handle @unifi {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8443 {
        transport http {
          tls_insecure_skip_verify
        }
      }
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8443 {
        transport http {
          tls_insecure_skip_verify
        }
      }
    }

    authorize with admin_policy
    reverse_proxy localhost:8443 {
      transport http {
        tls_insecure_skip_verify
      }
    }
  }

  @cups host cups.adamhl.dev
  handle @cups {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:631 {
        header_up Host 127.0.0.1
      }
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:631 {
        header_up Host 127.0.0.1
      }
    }

    authorize with admin_policy
    reverse_proxy localhost:631 {
      header_up Host 127.0.0.1
    }
  }

  @vault host vault.adamhl.dev
  handle @vault {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8000
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8000
    }

    authorize with admin_policy
    reverse_proxy localhost:8000
  }

  @sync host sync.adamhl.dev
  handle @sync {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8001
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8001
    }

    authorize with admin_policy
    reverse_proxy localhost:8001
  }

  @files host files.adamhl.dev
  handle @files {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8002
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8002
    }

    authorize with admin_policy
    reverse_proxy localhost:8002
  }

  @n8n host n8n.adamhl.dev
  handle @n8n {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8003
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8003
    }

    authorize with admin_policy
    reverse_proxy localhost:8003
  }

  @utk host utk.adamhl.dev
  handle @utk {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy zuko.lan:8004
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8004
    }

    authorize with admin_policy
    reverse_proxy zuko.lan:8004
  }

  @dashdot host dashdot.adamhl.dev
  handle @dashdot {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8005
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8005
    }

    authorize with admin_policy
    reverse_proxy localhost:8005
  }

  @sonarr host sonarr.adamhl.dev
  handle @sonarr {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8006
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8006
    }

    authorize with admin_policy
    reverse_proxy localhost:8006
  }

  @radarr host radarr.adamhl.dev
  handle @radarr {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8007
    }
    
    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8007
    }

    authorize with admin_policy
    reverse_proxy localhost:8007
  }

  @qb host qb.adamhl.dev
  handle @qb {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8008
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8008
    }

    authorize with admin_policy
    reverse_proxy localhost:8008
  }

  @ha host ha.adamhl.dev
  handle @ha {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8009
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8009
    }

    authorize with admin_policy
    reverse_proxy localhost:8009
  }

  @scrutiny host scrutiny.adamhl.dev
  handle @scrutiny {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8010
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8010
    }

    authorize with admin_policy
    reverse_proxy localhost:8010
  }

  @homarr host homarr.adamhl.dev
  handle @homarr {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8011
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8011
    }

    authorize with admin_policy
    reverse_proxy localhost:8011
  }

  @z2m host z2m.adamhl.dev
  handle @z2m {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8012
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8012
    }

    authorize with admin_policy
    reverse_proxy localhost:8012
  }

  @kavita host kavita.adamhl.dev
  handle @kavita {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8013
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8013
    }

    authorize with admin_policy
    reverse_proxy localhost:8013
  }

  @cyberchef host cyberchef.adamhl.dev
  handle @cyberchef {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8014
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8014
    }

    authorize with admin_policy
    reverse_proxy localhost:8014
  }

  @jellyfin host jellyfin.adamhl.dev
  handle @jellyfin {
    
    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8015
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8015
    }

    authorize with admin_policy
    reverse_proxy localhost:8015
  }

  @plex host plex.adamhl.dev
  handle @plex {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8016
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8016
    }

    authorize with admin_policy
    reverse_proxy localhost:8016
  }

  @webtop host webtop.adamhl.dev
  handle @webtop {

    @private_ip remote_ip private_ranges
    handle @private_ip {
      reverse_proxy localhost:8017
    }

    @tailscale remote_ip 100.93.24.12 100.126.163.49
    handle @tailscale {
      reverse_proxy localhost:8017
    }

    authorize with admin_policy
    reverse_proxy localhost:8017
  }
}
EOF