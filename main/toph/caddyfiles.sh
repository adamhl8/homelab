#!/bin/bash

mkdir ~/caddy/

# Caddyfile
tee ~/caddy/Caddyfile << EOF
import /home/adam/caddy/auth.caddy
import /home/adam/caddy/adamhl.dev.caddy
EOF
~/caddy/caddy fmt -overwrite ~/caddy/Caddyfile

# auth
tee ~/caddy/auth.caddy << EOF
{
  order authorize before reverse_proxy
  order authenticate before respond

  security {
    local identity store localdb {
      realm local
      path /home/adam/caddy/users.json
    }
    
    authentication portal authportal {
      enable identity store localdb
      cookie domain adamhl.dev
      cookie lifetime 172800
      crypto default token lifetime 86400
      
      ui {
        links {
          "Plex" https://plex.adamhl.dev
          "Vaultwarden" https://vault.adamhl.dev
          "Syncthing" https://sync.adamhl.dev
          "File Browser" https://files.adamhl.dev
          "n8n" https://n8n.adamhl.dev
          "Uptime Kuma" https://utk.adamhl.dev
          "Ward" https://ward.adamhl.dev
          "XBackBone" https://share.adamhl.dev
          "wg-access-server" https://wg.adamhl.dev
          "webtop" https://webtop.adamhl.dev
          "SearXNG" https://search.adamhl.dev
          "Sonarr" https://sonarr.adamhl.dev
          "Radarr" https://radarr.adamhl.dev
          "qBittorrent" https://qb.adamhl.dev
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

auth.adamhl.dev {
  authenticate with authportal
}
EOF
~/caddy/caddy fmt -overwrite ~/caddy/auth.caddy

# adamhl.dev
read -p "utkauth_token: " utkauth_token
tee ~/caddy/adamhl.dev.caddy << EOF
plex.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:32400
  }

  authorize with admin_policy
  reverse_proxy localhost:32400
}

vault.adamhl.dev {
  reverse_proxy localhost:8000
}

sync.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8001
  }

  authorize with admin_policy
  reverse_proxy localhost:8001
}

files.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8002
  }

  authorize with admin_policy
  reverse_proxy localhost:8002
}

n8n.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8003
  }

  handle /webhook/* {
    reverse_proxy localhost:8003
  }

  authorize with admin_policy
  reverse_proxy localhost:8003
}

utk.adamhl.dev {
  authorize with admin_policy
  reverse_proxy zuko.lan:8004
}

ward.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8005
  }

  authorize with admin_policy
  reverse_proxy localhost:8005
}

share.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8006
  }

  @allow path /upload /DUPI0/* /static/*
  handle @allow {
    reverse_proxy localhost:8006
  }

  authorize with admin_policy
  reverse_proxy localhost:8006
}

wg.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8007
  }

  authorize with admin_policy
  reverse_proxy localhost:8007
}

webtop.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8008
  }

  authorize with admin_policy
  reverse_proxy localhost:8008
}

search.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8009
  }

  authorize with admin_policy
  reverse_proxy localhost:8009
}

sonarr.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8010
  }

  authorize with admin_policy
  reverse_proxy localhost:8010
}

radarr.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8011
  }

  authorize with admin_policy
  reverse_proxy localhost:8011
}

qb.adamhl.dev {
  @utkauth header Utkauth ${utkauth_token}
  handle @utkauth {
    reverse_proxy localhost:8012
  }

  authorize with admin_policy
  reverse_proxy localhost:8012
}
EOF
~/caddy/caddy fmt -overwrite ~/caddy/adamhl.dev.caddy