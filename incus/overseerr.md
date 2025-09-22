```sh
incus launch images:debian/13/cloud overseerr \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`compose.yaml`:

```yaml
name: overseerr

services:
  overseerr:
    container_name: overseerr
    image: lscr.io/linuxserver/overseerr
    restart: always
    ports:
      - 8000:5055
    volumes:
      - ./overseerr/:/config/
    environment:
      - TZ=America/Chicago
      - PUID=1000
      - PGID=1000
```

```sh
docker compose up -d
```
