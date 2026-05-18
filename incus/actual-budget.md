```sh
incus launch images:debian/13/cloud actual-budget \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
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

volumes:
  actual-budget:
```

```sh
docker compose up -d
```
