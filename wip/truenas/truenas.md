mkdir -p bin

download restic binary

restic init

should I have created a dataset for user home directories?

## install tailscale

https://tailscale.com/kb/1369/taildrive?tab=linux

custom app

```yaml
services:
  tailscale:
    container_name: tailscale
    image: tailscale/tailscale
    restart: always
    network_mode: host
    privileged: true
    volumes:
      - ./data/:/var/lib/tailscale/
      - /dev/net/tun:/dev/net/tun
      - /mnt/nas/storage/:/nas/storage/
    environment:
      - TS_AUTHKEY=tskey-auth-kvWMtrQ8Z611CNTRL-X8jhU2LRUFakxALCXgHqCaQWdherK2dre
      - TS_AUTH_ONCE=true
      - TS_USERSPACE=false
```

mkdir -p /mnt/nas/adam/docker/tailscale

// data folder should be owned by root
sudo chown -R root:root /mnt/nas/adam/docker/tailscale

in container:
tailscale drive share storage /nas/storage/

## backrest

mkdir -p /mnt/nas/adam/docker/backrest/
sudo chown -R root:root /mnt/nas/adam/docker/backrest

```yaml
services:
  backrest:
    container_name: backrest
    image: garethgeorge/backrest
    restart: always
    ports:
      - 9898:9898
    volumes:
      - ./data:/data
      - ./config:/config
      - ./cache:/cache
      - /mnt/nas/storage:/nas/storage
    environment:
      - BACKREST_DATA=/data
      - BACKREST_CONFIG=/config/config.json
      - XDG_CACHE_HOME=/cache
      - TZ=America/Chicago
```

### dockge

```yaml
services:
  dockge:
    container_name: dockge
    image: louislam/dockge
    restart: always
    ports:
      - 8001:5001
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /mnt/nas/adam/dockge/data:/app/data
      - /mnt/nas/adam/dockge/stacks:/mnt/nas/adam/dockge/stacks
    environment:
      - DOCKGE_STACKS_DIR=/mnt/nas/adam/dockge/stacks
```