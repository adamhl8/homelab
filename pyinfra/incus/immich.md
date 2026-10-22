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
IMMICH_VERSION=v3
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
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION}
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
    image: ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION}
    restart: always
    volumes:
      - model-cache:/cache
    env_file:
      - .env
    healthcheck:
      disable: false

  redis:
    container_name: ${COMPOSE_PROJECT_NAME}-redis
    image: docker.io/valkey/valkey:9@sha256:70739f85ad2ee01a726a965584a0f94895f01b0c60b3cc8b0aeef11eaa6888cf
    restart: always
    healthcheck:
      test: redis-cli ping | grep -q PONG || exit 1

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0@sha256:bcf63357191b76a916ae5eb93464d65c07511da41e3bf7a8416db519b40b1c23
    restart: always
    shm_size: 128mb
    volumes:
      - ${DB_DATA_LOCATION}:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_DATABASE_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--data-checksums"
    healthcheck:
      disable: false

volumes:
  model-cache:
```

```sh
docker compose up -d
```
