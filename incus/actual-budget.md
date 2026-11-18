```sh
incus launch images:debian/13/cloud actual-budget \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`.env`:

```env
ACTUAL_SERVER_URL=http://actual-budget:5006
ACTUAL_SERVER_PASSWORD=value
ACTUAL_SYNC_ID=28ce7ea5-5f3f-4495-91c6-917f64cb4400
ACTUAL_VENMO_ACCOUNT_ID=279ac62a-407b-47c0-9321-3726df67fe6b

INITIAL_BACKFILL_DAYS=25
IMPORT_PENDING=false
SYNC_ON_BOOT=true
```

`compose.yaml`:

```yaml
name: actual-budget

services:
  actual-budget:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: actualbudget/actual-server
    restart: always
    ports:
      - 8000:5006
    volumes:
      - actual-budget:/data/
    healthcheck:
      test: ["CMD-SHELL", "node src/scripts/health-check.js"]
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 20s

  actual-budget-venmo-importer:
    container_name: actual-budget-venmo-importer
    image: ghcr.io/adamhl8/actual-budget-venmo-importer:latest
    restart: always
    # Required so `docker compose run --rm actual-budget-venmo-importer auth` can prompt interactively.
    stdin_open: true
    tty: true
    volumes:
      - ./data/:/data/
      - ./actual-budget-venmo-importer-cache:/app/actual-cache
    env_file: .env

volumes:
  actual-budget:
```

```sh
docker compose up -d
```
