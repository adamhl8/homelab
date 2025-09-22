```sh
incus launch images:debian/13/cloud paperless \
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
PAPERLESS_SECRET_KEY=<value>
```

`compose.yaml`:

```yaml
name: paperless-ngx

services:
  paperless-ngx:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/paperless-ngx/paperless-ngx
    restart: always
    ports:
      - 8000:8000
    volumes:
      - data:/usr/src/paperless/data/
      - /nas/storage/Paperless/:/usr/src/paperless/media/
      - ./export/:/usr/src/paperless/export/
    environment:
      PAPERLESS_URL: https://paperless.adamhl.dev
      PAPERLESS_SECRET_KEY: ${PAPERLESS_SECRET_KEY}
      PAPERLESS_TIME_ZONE: America/Chicago
      PAPERLESS_CONSUMER_DELETE_DUPLICATES: true
      PAPERLESS_CONSUMER_RECURSIVE: true
      PAPERLESS_FILENAME_FORMAT: "{{ created_year }}{{ created_month }}{{ created_day }} {{ title }}"
      PAPERLESS_OCR_LANGUAGE: eng
      PAPERLESS_OCR_USER_ARGS: '{"continue_on_soft_render_error": true}'
      PAPERLESS_OCR_SKIP_ARCHIVE_FILE: always
      PAPERLESS_DBHOST: postgres
      PAPERLESS_REDIS: redis://redis:6379
      PAPERLESS_TIKA_ENABLED: 1
      PAPERLESS_TIKA_ENDPOINT: http://tika:9998
      PAPERLESS_TIKA_GOTENBERG_ENDPOINT: http://gotenberg:3000
    depends_on:
      - postgres
      - redis
      - tika
      - gotenberg

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: docker.io/library/postgres:17
    restart: always
    volumes:
      - postgres:/var/lib/postgresql/data/
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperless

  redis:
    container_name: ${COMPOSE_PROJECT_NAME}-redis
    image: docker.io/library/redis:8
    restart: always
    volumes:
      - redis:/data/

  tika:
    container_name: ${COMPOSE_PROJECT_NAME}-tika
    image: docker.io/apache/tika:latest
    restart: always

  gotenberg:
    container_name: ${COMPOSE_PROJECT_NAME}-gotenberg
    image: docker.io/gotenberg/gotenberg:8.20
    restart: always
    command:
      - "gotenberg"
      - "--chromium-disable-javascript=true"
      - "--chromium-allow-list=file:///tmp/.*"

volumes:
  data:
  postgres:
  redis:
```

```sh
docker compose up -d
```

```sh
docker compose exec paperless-ngx document_create_classifier
docker compose exec paperless-ngx document_thumbnails
docker compose exec paperless-ngx document_index reindex
docker compose exec paperless-ngx document_index optimize
docker compose exec paperless-ngx document_sanity_checker
```

for new user:

```sh
docker compose run --rm -e DJANGO_SUPERUSER_PASSWORD='{homelab_password}' paperless-ngx createsuperuser --noinput --username 'adam' --email 'adamhl@pm.me'
```
