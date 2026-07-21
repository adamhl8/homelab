```sh
incus launch images:debian/13/cloud seerr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: seerr

services:
  seerr:
    container_name: seerr
    image: ghcr.io/seerr-team/seerr
    restart: always
    init: true
    ports:
      - 8000:5055
    volumes:
      - ./seerr/:/app/config/
    environment:
      - TZ=America/Chicago
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:5055/api/v1/settings/public || exit 1
      start_period: 20s
      timeout: 3s
      interval: 15s
      retries: 3
```

```sh
docker compose up -d
```
