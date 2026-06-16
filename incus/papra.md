```sh
incus launch images:debian/13/cloud papra \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -p docker \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

```sh
mkdir -p ./data/
```

`.env`:

```env
AUTH_SECRET=value
```

`compose.yaml`:

```yaml
name: papra

services:
  papra:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/papra-hq/papra
    restart: always
    user: 1000:1000
    ports:
      - 8000:1221
    environment:
      AUTH_SECRET: ${AUTH_SECRET}
      APP_BASE_URL: https://papra.adamhl.dev
      DATABASE_URL: file:./db/db.sqlite
      DOCUMENT_STORAGE_MAX_UPLOAD_SIZE: 0
      DOCUMENT_STORAGE_USE_LEGACY_STORAGE_KEY_DEFINITION_SYSTEM: false
      DOCUMENT_STORAGE_KEY_PATTERN: "{{currentDate | formatDate {yyyy}{MM}{dd}}} {{document.name}}"
    volumes:
      - /nas/storage/Papra/:/app/app-data/documents/
      - ./data/:/app/db/
```

```sh
docker compose up -d
```
