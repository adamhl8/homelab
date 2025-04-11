ssh -q -t root@pve.lan 'bash -l -c "pct create 112 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
 --hostname immich \
 --password password \
 --unprivileged 1 \
 --ssh-public-keys <(echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO8kVfp1izD27w8sucRuf2NnkRynVcmM5lZgzUcv+J8Y adam-macbook') \
 --rootfs local-zfs:16 \
 --cores 2 \
 --memory 2048 \
 --storage local-lvm \
 --net0 name=eth0,bridge=vmbr1,firewall=0,ip=dhcp \
 --mp0 /nas/storage,mp=/nas/storage \
 --features keyctl=1,nesting=1 \
 --onboot 1"'

/etc/pve/lxc/112.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

ssh -q -t root@pve.lan 'bash -l -c "pct start 109"'

# create static IP reservation: 10.8.8.{CT_ID}

# restart unbound

ssh -q -t root@immich.lan 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@immich.lan 'bash -l -c "apt install curl ca-certificates -y"'
ssh -q -t root@immich.lan 'bash -l -c "dpkg-reconfigure tzdata"'

curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
apt update
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

mkdir -p ~/immich/

~/immich/compose.yaml

```yaml
services:
  immich-server:
    container_name: immich-server
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION:-release}
    restart: always
    ports:
      - 8000:2283
    volumes:
      - ${UPLOAD_LOCATION}:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    depends_on:
      - redis
      - postgres
    healthcheck:
      disable: false

  immich-machine-learning:
    container_name: immich-machine-learning
    image: ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION:-release}
    restart: always
    volumes:
      - model-cache:/cache
    env_file:
      - .env
    healthcheck:
      disable: false

  redis:
    container_name: immich-redis
    image: docker.io/redis:6.2-alpine@sha256:148bb5411c184abd288d9aaed139c98123eeb8824c5d3fce03cf721db58066d8
    restart: always
    healthcheck:
      test: redis-cli ping || exit 1

  postgres:
    container_name: immich-postgres
    image: docker.io/tensorchord/pgvecto-rs:pg14-v0.2.0@sha256:739cdd626151ff1f796dc95a6591b55a714f341c737e27f045019ceabf8e8c52
    restart: always
    command: >-
      postgres -c shared_preload_libraries=vectors.so -c 'search_path="$$user", public, vectors' -c logging_collector=on -c max_wal_size=2GB -c shared_buffers=512MB -c wal_compression=on
    volumes:
      - ${DB_DATA_LOCATION}:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_DATABASE_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--data-checksums"
    healthcheck:
      test: >-
        pg_isready --dbname="$${POSTGRES_DB}" --username="$${POSTGRES_USER}" || exit 1; Chksum="$$(psql --dbname="$${POSTGRES_DB}" --username="$${POSTGRES_USER}" --tuples-only --no-align --command='SELECT COALESCE(SUM(checksum_failures), 0) FROM pg_stat_database')"; echo "checksum failure count is $$Chksum"; [ "$$Chksum" = '0' ] || exit 1
      interval: 5m
      start_interval: 30s
      start_period: 5m

volumes:
  model-cache:
```

~/immich/.env

```env
IMMICH_VERSION=release
UPLOAD_LOCATION=/nas/storage/Immich/
DB_DATA_LOCATION=./postgres/
DB_HOSTNAME=postgres
DB_DATABASE_NAME=immich
DB_USERNAME=postgres
DB_PASSWORD=postgres
TZ=America/Chicago
```

docker compose up -d
