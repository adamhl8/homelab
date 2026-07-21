```sh
incus launch images:debian/13/cloud umami \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`.env`:

```env
APP_SECRET=<value>
```

`compose.yaml`:

```yaml
name: umami

services:
  umami:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/umami-software/umami
    restart: always
    init: true
    ports:
      - 8000:3000
    environment:
      APP_SECRET: ${APP_SECRET}
      DATABASE_URL: postgresql://umami:umami@postgres:5432/umami
      COLLECT_API_ENDPOINT: /imamu
      TRACKER_SCRIPT_NAME: imamu.js
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl http://localhost:3000/api/heartbeat"]
      interval: 5s
      timeout: 5s
      retries: 5

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres:
```

```sh
docker compose up -d
```
