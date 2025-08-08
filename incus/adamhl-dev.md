```sh
incus launch images:debian/13/cloud adamhl-dev \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=2 \
  -c limits.memory=1GiB \
  -d root,size=16GiB
```

`.env`:

```
AWS_ACCESS_KEY_ID=value
AWS_SECRET_ACCESS_KEY=value
WATCHTOWER_API_TOKEN=value
```

`compose.yaml`:

```yaml
name: adamhl-dev

services:
  adamhl-dev:
    container_name: ${COMPOSE_PROJECT_NAME}
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    image: ghcr.io/adamhl8/adamhl.dev
    restart: always
    ports:
      - 8000:80
    volumes:
      - data:/data/
      - data:/config/

  ddns-route53:
    container_name: ${COMPOSE_PROJECT_NAME}-ddns-route53
    image: crazymax/ddns-route53
    restart: always
    environment:
      SCHEDULE: 0 * * * *
      DDNSR53_CREDENTIALS_ACCESSKEYID: ${AWS_ACCESS_KEY_ID}
      DDNSR53_CREDENTIALS_SECRETACCESSKEY: ${AWS_SECRET_ACCESS_KEY}
      DDNSR53_ROUTE53_HOSTEDZONEID: Z0001576IKPKC1SOE3BS
      DDNSR53_ROUTE53_RECORDSSET_0_NAME: adamhl.dev
      DDNSR53_ROUTE53_RECORDSSET_0_TYPE: A
      DDNSR53_ROUTE53_RECORDSSET_0_TTL: 60
      DDNSR53_ROUTE53_RECORDSSET_1_NAME: "*.adamhl.dev"
      DDNSR53_ROUTE53_RECORDSSET_1_TYPE: A
      DDNSR53_ROUTE53_RECORDSSET_1_TTL: 60

  watchtower:
    container_name: ${COMPOSE_PROJECT_NAME}-watchtower
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
    image: containrrr/watchtower
    restart: always
    ports:
      - 8001:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_CLEANUP: true
      WATCHTOWER_LABEL_ENABLE: true
      WATCHTOWER_HTTP_API_UPDATE: true
      WATCHTOWER_HTTP_API_TOKEN: ${WATCHTOWER_API_TOKEN}

volumes:
  data:
```

```sh
docker compose up -d
```
