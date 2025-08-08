```sh
incus launch images:debian/13/cloud palmr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -c limits.memory=1GiB \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: palmr

services:
  palmr:
    container_name: palmr
    image: kyantech/palmr
    restart: always
    ports:
      - 8000:5487
    volumes:
      - data:/app/server
    environment:
      SECURE_SITE: true

volumes:
  data:
```

```sh
docker compose up -d
```
