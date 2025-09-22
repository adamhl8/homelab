```sh
incus launch images:debian/13/cloud scrutiny \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```sh
mkdir -p ~/data/
```

`~/data/scrutiny.yaml`:

```yaml
notify:
  urls:
    - "smtp://AKIAT5NKIWDOWXMHLAPS:<smtp_password>@email-smtp.us-east-1.amazonaws.com:587/?fromAddress=scrutiny@adamhl.dev&toAddresses=adamhl@pm.me"
```

```sh
sudo chown -R root:root ~/data/
```

`compose.yaml`:

```yaml
name: scrutiny

services:
  scrutiny:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/analogj/scrutiny:master-web
    restart: always
    ports:
      - 8000:8080
    volumes:
      - ./data/:/opt/scrutiny/config/
    environment:
      SCRUTINY_WEB_INFLUXDB_HOST: influxdb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 5s
      timeout: 10s
      retries: 20
      start_period: 10s
    depends_on:
      influxdb:
        condition: service_healthy

  influxdb:
    container_name: ${COMPOSE_PROJECT_NAME}-influxdb
    image: influxdb:2.2
    restart: always
    volumes:
      - influxdb:/var/lib/influxdb2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8086/health"]
      interval: 5s
      timeout: 10s
      retries: 20

volumes:
  influxdb:
```

```sh
docker compose up -d
```

On Incus:

```sh
sudo apt install -y smartmontools
mkdir -p ~/bin/
curl -fsSLo ~/bin/scrutiny-collector https://github.com/analogj/scrutiny/releases/latest/download/scrutiny-collector-metrics-linux-amd64
chmod +x ~/bin/scrutiny-collector
```

`/etc/systemd/system/scrutiny-collector.service`:

```
[Unit]
Description=scrutiny-collector

[Service]
Type=oneshot
ExecStart=/home/adam/bin/scrutiny-collector run --api-endpoint http://scrutiny.lan:8000
```

`/etc/systemd/system/scrutiny-collector.timer`:

```
[Unit]
Description=Daily scrutiny-collector run

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```sh
sudo systemctl enable --now scrutiny-collector.timer
sudo systemctl start scrutiny-collector.service
```
