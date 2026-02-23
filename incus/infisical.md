```sh
incus launch images:debian/13/cloud infisical \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`.env`:

```
ENCRYPTION_KEY=REPLACE_ME
AUTH_SECRET=REPLACE_ME
SITE_URL=https://infisical.adamhl.dev

POSTGRES_DB=infisical
POSTGRES_USER=infisical
POSTGRES_PASSWORD=infisical
DB_CONNECTION_URI=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

REDIS_URL=redis://redis:6379

SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_USERNAME=AKIAT5NKIWDOWXMHLAPS
SMTP_PASSWORD=REPLACE_ME
SMTP_PORT=465
SMTP_FROM_ADDRESS=infisical@adamhl.dev
SMTP_FROM_NAME=Infisical
```

`compose.yaml`:

```yaml
name: infisical

services:
  infisical-backend:
    container_name: ${COMPOSE_PROJECT_NAME}-backend
    image: infisical/infisical
    restart: always
    networks:
      - ${COMPOSE_PROJECT_NAME}
    ports:
      - 8000:8080
    env_file: .env
    environment:
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  redis:
    container_name: ${COMPOSE_PROJECT_NAME}-redis
    image: redis
    restart: always
    networks:
      - ${COMPOSE_PROJECT_NAME}
    volumes:
      - redis:/data
    env_file: .env
    environment:
      - ALLOW_EMPTY_PASSWORD=yes

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: postgres:14-alpine
    restart: always
    networks:
      - ${COMPOSE_PROJECT_NAME}
    volumes:
      - postgres:/var/lib/postgresql/data
    env_file: .env
    healthcheck:
      test: "pg_isready --username=${POSTGRES_USER} && psql --username=${POSTGRES_USER} --list"
      interval: 5s
      timeout: 10s
      retries: 10

volumes:
  postgres:
  redis:

networks:
  infisical:
```

```sh
docker compose up -d
```
