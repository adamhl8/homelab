```sh
incus launch images:debian/13/cloud guild-sim \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

`.env`:

```
PUBLIC_SITE_URL=https://guild-sim.adamhl.dev
DATABASE_URL=file:db/prod.db
BETTER_AUTH_SECRETS=value
BNET_CLIENT_ID=bf998f1b5a114e3e97088b390ca32cef
BNET_CLIENT_SECRET=value
WOWAUDIT_API_KEY=value
RAIDBOTS_EMAIL=adamhl@pm.me
RAIDBOTS_PASSWORD=value

WATCHTOWER_API_TOKEN=value
```

`compose.yaml`:

```yaml
name: guild-sim

services:
  guild-sim:
    container_name: ${COMPOSE_PROJECT_NAME}
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    image: ghcr.io/adamhl8/guild-sim
    restart: always
    ports:
      - 8080:8080
    volumes:
      - ./data/:/app/db/
    env_file: .env
    stop_grace_period: 5m

  watchtower:
    container_name: ${COMPOSE_PROJECT_NAME}-watchtower
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
    image: nickfedor/watchtower
    restart: always
    ports:
      - 8081:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_CLEANUP: true
      WATCHTOWER_LABEL_ENABLE: true
      WATCHTOWER_HTTP_API_UPDATE: true
      WATCHTOWER_HTTP_API_TOKEN: ${WATCHTOWER_API_TOKEN}
```

```sh
docker compose up -d
```
