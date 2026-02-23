```sh
incus launch images:debian/13/cloud byparr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: byparr

services:
  byparr:
    container_name: byparr
    image: ghcr.io/thephaseless/byparr
    restart: always
    ports:
      - 8000:8191
    environment:
      - TZ=America/Chicago
```
