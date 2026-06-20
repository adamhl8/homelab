```sh
incus launch images:debian/13/cloud homepage \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

---

`homepage-env.ts`:

```ts
import { $ } from "bun"

/** sops key -> homepage env var (without HOMEPAGE_VAR_ prefix) */
const SECRET_TO_ENV = {
  immich_key: "IMMICH",
  jellyfin_api_key: "JELLYFIN",
  seerr_api_key: "SEERR",
  radarr_api_key: "RADARR",
  sonarr_api_key: "SONARR",
  prowlarr_api_key: "PROWLARR",
  unifi_homepage_password: "UNIFI",
  homelab_password: "QBITTORRENT",
} as const

const json = await $`sops -d --output-type json ~/secrets.yaml`.text()
const secrets: Record<string, string> = JSON.parse(json)

for (const [key, envVar] of Object.entries(SECRET_TO_ENV)) {
  const secret = secrets[key]
  if (!secret) throw new Error(`missing secret: ${key}`)
  console.log(`HOMEPAGE_VAR_${envVar}=${secret}`)
}
```

```sh
bun run homepage-env.ts | pbcopy
```

---

`.env`: from `bun run homepage-env.ts`

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
    env_file:
      - .env
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
        - UniFi:
            icon: unifi
            href: https://unifi.adamhl.dev
            siteMonitor: https://ucg-fiber.lan
            widget:
              type: unifi
              url: https://ucg-fiber.lan
              username: homepage
              password: "{{HOMEPAGE_VAR_UNIFI}}"
              fields: ["uptime", "lan", "lan_users", "lan_devices"]
        - caddy:
            icon: caddy
            ping: http://caddy.lan:2019
            widget:
              type: caddy
              url: http://caddy.lan:2019
        - Tailscale:
            icon: tailscale
            ping: tailscale.lan
        - Pi:
            icon: raspberry-pi
            ping: pi.lan

    - NAS:
        - Backrest:
            icon: backrest
            href: https://backrest.adamhl.dev
            siteMonitor: http://backrest.lan:8000
            widget:
              type: backrest
              url: http://backrest.lan:8000
              fields: ["num_success_latest", "num_failure_latest", "bytes_added_30"]
        - Scrutiny:
            icon: scrutiny
            href: https://scrutiny.adamhl.dev
            siteMonitor: http://scrutiny.lan:8000
            widget:
              type: scrutiny
              url: http://scrutiny.lan:8000
              fields: ["failed", "passed", "unknown"]

- Services:
    - Immich:
        icon: immich
        href: https://immich.adamhl.dev
        siteMonitor: http://immich.lan:8000
        widget:
          type: immich
          url: http://immich.lan:8000
          key: "{{HOMEPAGE_VAR_IMMICH}}"
          version: 2
          fields: ["photos", "videos", "storage"]
    - Papra:
        icon: papra
        href: https://papra.adamhl.dev
        siteMonitor: http://papra.lan:8000
    - Actual Budget:
        icon: actual-budget
        href: https://actual-budget.adamhl.dev
        siteMonitor: http://actual-budget.lan:8000
    - Umami:
        icon: umami
        href: https://umami.adamhl.dev
        siteMonitor: http://umami.lan:8000
    - File Browser:
        icon: filebrowser
        href: https://filebrowser.adamhl.dev
        siteMonitor: http://filebrowser.lan:8000

- Media:
    - Jellyfin:
        icon: jellyfin
        href: https://jellyfin.adamhl.dev
        siteMonitor: http://jellyfin.lan:8000
        widget:
          type: jellyfin
          url: http://jellyfin.lan:8000
          key: "{{HOMEPAGE_VAR_JELLYFIN}}"
          enableBlocks: true
          enableUser: true
          enableMediaControl: false
          showEpisodeNumber: true
          expandOneStreamToTwoRows: false
          fields: ["movies", "series"]
    - Seerr:
        icon: seerr
        href: https://seerr.adamhl.dev
        siteMonitor: http://seerr.lan:8000
        widget:
          type: seerr
          url: http://seerr.lan:8000
          key: "{{HOMEPAGE_VAR_SEERR}}"
          fields: ["pending", "issues"]
    - Radarr:
        icon: radarr
        href: https://radarr.adamhl.dev
        siteMonitor: http://radarr.lan:8000
        widget:
          type: radarr
          url: http://radarr.lan:8000
          key: "{{HOMEPAGE_VAR_RADARR}}"
          fields: ["wanted", "queued", "movies"]
    - Sonarr:
        icon: sonarr
        href: https://sonarr.adamhl.dev
        siteMonitor: http://sonarr.lan:8000
        widget:
          type: sonarr
          url: http://sonarr.lan:8000
          key: "{{HOMEPAGE_VAR_SONARR}}"
          fields: ["wanted", "queued", "series"]
    - Prowlarr:
        icon: prowlarr
        href: https://prowlarr.adamhl.dev
        siteMonitor: http://prowlarr.lan:8000
        widget:
          type: prowlarr
          url: http://prowlarr.lan:8000
          key: "{{HOMEPAGE_VAR_PROWLARR}}"
          fields: ["numberOfGrabs", "numberOfQueries", "numberOfFailGrabs", "numberOfFailQueries"]
    - qBittorrent:
        icon: qbittorrent
        href: https://qbittorrent.adamhl.dev
        siteMonitor: http://qbittorrent.lan:8000
        widget:
          type: qbittorrent
          url: http://qbittorrent.lan:8000
          username: adam
          password: "{{HOMEPAGE_VAR_QBITTORRENT}}"
          enableLeechProgress: true
          enableLeechSize: true
          fields: ["leech", "download", "seed", "upload"]
    - FlareSolverr:
        icon: flaresolverr
        siteMonitor: http://flaresolverr.lan:8000
    - Byparr:
        icon: byparr
        siteMonitor: http://byparr.lan:8000

- Websites:
    - adamhl.dev:
        href: https://adamhl.dev
        siteMonitor: http://adamhl-dev.lan:8000
    - joieparma.com:
        icon: wordpress
        href: https://joieparma.com
        siteMonitor: http://joieparma-com.lan:8000
    - Battlegrind:
        href: https://battlegrind.adamhl.dev
        siteMonitor: http://battlegrind.lan:8000
```
