```sh
incus launch images:debian/13/cloud immich \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -p docker \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

`.env`:

```env
IMMICH_VERSION=release
UPLOAD_LOCATION=/nas/storage/Immich/
DB_DATA_LOCATION=./postgres
DB_HOSTNAME=postgres
DB_DATABASE_NAME=immich
DB_USERNAME=postgres
DB_PASSWORD=postgres
TZ=America/Chicago
```

`compose.yaml`:

```yaml
name: immich

services:
  immich-server:
    container_name: ${COMPOSE_PROJECT_NAME}-server
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION:-release}
    restart: always
    ports:
      - 8000:2283
    volumes:
      - ${UPLOAD_LOCATION}:/data/
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    depends_on:
      - redis
      - postgres
    healthcheck:
      disable: false

  immich-machine-learning:
    container_name: ${COMPOSE_PROJECT_NAME}-machine-learning
    image: ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION:-release}
    restart: always
    volumes:
      - model-cache:/cache
    env_file:
      - .env
    healthcheck:
      disable: false

  redis:
    container_name: ${COMPOSE_PROJECT_NAME}-redis
    image: docker.io/valkey/valkey:8-bookworm@sha256:fea8b3e67b15729d4bb70589eb03367bab9ad1ee89c876f54327fc7c6e618571
    restart: always
    healthcheck:
      test: redis-cli ping || exit 1

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0@sha256:41eacbe83eca995561fe43814fd4891e16e39632806253848efaf04d3c8a8b84
    restart: always
    shm_size: 128mb
    volumes:
      - ${DB_DATA_LOCATION}:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_DATABASE_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--data-checksums"

volumes:
  model-cache:
```

```sh
docker compose up -d
```
