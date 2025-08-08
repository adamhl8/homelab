```sh
incus launch images:debian/13/cloud homepage \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -c limits.memory=1GiB \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: homepage

services:
  homepage:
    container_name: homepage
    image: ghcr.io/gethomepage/homepage
    restart: always
    ports:
      - 8000:3000
    volumes:
      - ./homepage/:/app/config/
    environment:
      PUID: 1000
      PGID: 1000
      HOMEPAGE_ALLOWED_HOSTS: "*"
```

```sh
docker compose up -d
```

`~/homepage/settings.yaml`:

```yaml
title: Homelab
theme: dark
color: neutral
disableCollapse: true
headerStyle: clean
statusStyle: "dot"
```

`~/homepage/services.yaml`:

```yaml
- Homelab:
    - Incus:
        icon: incus
        href: https://incus.adamhl.dev
        siteMonitor: http://incus.lan:8000
    - Network:
        - OPNSense:
            icon: opnsense
            href: https://opnsense.adamhl.dev
            siteMonitor: http://opnsense.lan
            widget:
              type: opnsense
              url: http://opnsense.lan
              username: <value>
              password: <value>
        - UniFi Controller:
            icon: unifi-controller
            href: https://unifi.adamhl.dev
            siteMonitor: https://unifi.lan:8000
            widget:
              type: unifi
              url: https://unifi.lan:8000
              username: homepage
              password: <value>
              fields: ["uptime", "lan", "lan_users", "lan_devices"]
        - caddy:
            icon: caddy
            ping: http://caddy.lan:2019
            widget:
              type: caddy
              url: http://caddy.lan:2019

    - NAS:
        - Backrest:
            icon: backrest
            href: https://backrest.adamhl.dev
            siteMonitor: http://backrest.lan:8000
            widget:
              type: healthchecks
              url: https://healthchecks.io
              key: <value>
              uuid: <value>
        - Scrutiny:
            icon: scrutiny
            href: https://scrutiny.adamhl.dev
            siteMonitor: http://scrutiny.lan:8000
            widget:
              type: scrutiny
              url: http://scrutiny.lan:8000

- Services:
    - Paperless-ngx:
        icon: paperless-ngx
        href: https://paperless.adamhl.dev
        siteMonitor: http://paperless.lan:8000
        widget:
          type: paperlessngx
          url: http://paperless.lan:8000
          username: adam
          password: <value>
    - Immich:
        icon: immich
        href: https://immich.adamhl.dev
        siteMonitor: http://immich.lan:8000
        widget:
          type: immich
          url: http://immich.lan:8000
          key: <value>
          version: 2
          fields: ["photos", "videos"]
    - File Browser:
        icon: filebrowser
        href: https://filebrowser.adamhl.dev
        siteMonitor: http://filebrowser.lan:8000
    - Palmr:
        href: https://share.adamhl.dev
        siteMonitor: http://palmr.lan:8000

- Media:
    - Plex:
        icon: plex
        href: https://plex.adamhl.dev
        siteMonitor: http://plex.lan:32400
        widget:
          type: plex
          url: http://plex.lan:32400
          key: <value>
          fields: ["streams", "movies", "tv"]
    - Overseerr:
        icon: overseerr
        href: https://overseerr.adamhl.dev
        siteMonitor: http://overseerr.lan:8000
        widget:
          type: overseerr
          url: http://overseerr.lan:8000
          key: <value>
    - Radarr:
        icon: radarr
        href: https://radarr.adamhl.dev
        siteMonitor: http://radarr.lan:8000
        widget:
          type: radarr
          url: http://radarr.lan:8000
          key: <value>
          fields: ["wanted", "queued"]
    - Sonarr:
        icon: sonarr
        href: https://sonarr.adamhl.dev
        siteMonitor: http://sonarr.lan:8000
        widget:
          type: sonarr
          url: http://sonarr.lan:8000
          key: <value>
          fields: ["wanted", "queued"]
    - Prowlarr:
        icon: prowlarr
        href: https://prowlarr.adamhl.dev
        siteMonitor: http://prowlarr.lan:8000
        widget:
          type: prowlarr
          url: http://prowlarr.lan:8000
          key: <value>
    - qBittorrent:
        icon: qbittorrent
        href: https://qbittorrent.adamhl.dev
        siteMonitor: http://qbittorrent.lan:8000
        widget:
          type: qbittorrent
          url: http://qbittorrent.lan:8000
          username: adam
          password: <value>
          enableLeechProgress: true
```
