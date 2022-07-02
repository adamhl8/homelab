#!/bin/bash

mkdir ~/caddy/

tee ~/caddy/Caddyfile << EOF
{
  acme_dns route53
}

*.adamhl.dev {
  @plex host plex.adamhl.dev
  handle @plex {
    reverse_proxy localhost:32400
  }

  @unifi host unifi.adamhl.dev
  handle @unifi {
    reverse_proxy localhost:8443 {
      transport http {
        tls_insecure_skip_verify
      }
    }
  }

  @cups host cups.adamhl.dev
  handle @cups {
    reverse_proxy localhost:631 {
      header_up Host 127.0.0.1
    }
  }

  @vault host vault.adamhl.dev
  handle @vault {
    reverse_proxy localhost:8000
  }

  @sync host sync.adamhl.dev
  handle @sync {
    reverse_proxy localhost:8001
  }

  @files host files.adamhl.dev
  handle @files {
    reverse_proxy localhost:8002
  }

  @n8n host n8n.adamhl.dev
  handle @n8n {
    reverse_proxy localhost:8003
  }

  @utk host utk.adamhl.dev
  handle @utk {
    reverse_proxy zuko.lan:8004
  }

  @dashdot host dashdot.adamhl.dev
  handle @dashdot {
    reverse_proxy localhost:8005
  }

  @sonarr host sonarr.adamhl.dev
  handle @sonarr {
    reverse_proxy localhost:8006
  }

  @radarr host radarr.adamhl.dev
  handle @radarr {
    reverse_proxy localhost:8007
  }

  @qb host qb.adamhl.dev
  handle @qb {
    reverse_proxy localhost:8008
  }

  @ha host ha.adamhl.dev
  handle @ha {
    reverse_proxy localhost:8009
  }

  @scrutiny host scrutiny.adamhl.dev
  handle @scrutiny {
    reverse_proxy localhost:8010
  }

  @homarr host homarr.adamhl.dev
  handle @homarr {
    reverse_proxy localhost:8011
  }

  @z2m host z2m.adamhl.dev
  handle @z2m {
    reverse_proxy localhost:8012
  }

  @kavita host kavita.adamhl.dev
  handle @kavita {
    reverse_proxy localhost:8013
  }
}
EOF