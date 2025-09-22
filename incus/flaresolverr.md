```sh
incus launch images:debian/13/cloud flaresolverr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: flaresolverr

services:
  flaresolverr:
    container_name: flaresolverr
    image: ghcr.io/flaresolverr/flaresolverr
    restart: always
    ports:
      - 8000:8191
    environment:
      - TZ=America/Chicago
```
