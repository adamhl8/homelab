ssh -q -t root@pve.lan 'bash -l -c "pct create 109 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
 --hostname paperless \
 --password Ov3rclocking! \
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

/etc/pve/lxc/109.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

ssh -q -t root@pve.lan 'bash -l -c "pct start 109"'

ssh -q -t root@10.8.8.109 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@10.8.8.109 'bash -l -c "apt install curl ca-certificates -y"'
ssh -q -t root@10.8.8.109 'bash -l -c "dpkg-reconfigure tzdata"'

curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
apt update
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

mkdir -p ~/paperless/

~/paperless/compose.yaml

```yaml
services:
  paperless-ngx:
    container_name: paperless-ngx
    image: ghcr.io/paperless-ngx/paperless-ngx
    restart: always
    ports:
      - 8000:8000
    volumes:
      - ./data/:/usr/src/paperless/data/
      - /nas/storage/Paperless/:/usr/src/paperless/media/
      - ./consume/:/usr/src/paperless/consume/
      - ./export/:/usr/src/paperless/export/
    environment:
      PAPERLESS_URL: https://paperless.adamhl.dev
      PAPERLESS_SECRET_KEY: ${paperless_secret_key}
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
    healthcheck:
      test:
        - CMD
        - curl
        - -fs
        - -S
        - --max-time
        - "2"
        - http://localhost:8000
      interval: 30s
      timeout: 10s
      retries: 5
    depends_on:
      - postgres
      - redis
      - tika
      - gotenberg
  postgres:
    container_name: paperless-ngx-postgres
    image: docker.io/library/postgres:15
    restart: always
    volumes:
      - ./postgres/:/var/lib/postgresql/data/
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperless
  redis:
    container_name: paperless-ngx-redis
    image: docker.io/library/redis:7
    restart: always
    volumes:
      - ./redis/:/data/
  tika:
    container_name: paperless-ngx-tika
    image: ghcr.io/paperless-ngx/tika
    restart: always
  gotenberg:
    container_name: paperless-ngx-gotenberg
    image: docker.io/gotenberg/gotenberg:7.10
    restart: always
    command:
      - gotenberg
      - --chromium-disable-javascript=true
      - --chromium-allow-list=file:///tmp/.*
```

docker compose pull
docker compose up -d

docker compose exec paperless-ngx document_create_classifier
docker compose exec paperless-ngx document_thumbnails
docker compose exec paperless-ngx document_index reindex
docker compose exec paperless-ngx document_index optimize
docker compose exec paperless-ngx document_sanity_checker

for new user:
docker compose run --rm -e DJANGO_SUPERUSER_PASSWORD='{homelab_password}' paperless-ngx createsuperuser --noinput --username 'adam' --email 'adamhl@pm.me'
