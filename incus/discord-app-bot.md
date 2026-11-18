```sh
incus launch images:debian/13/cloud discord-app-bot \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

`.env`:

```env
BOT_TOKEN=value
APP_BOT_SECRET=value
```

`compose.yaml`:

```yaml
name: discord-app-bot

services:
  discord-app-bot:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/adamhl8/discord-app-bot
    restart: always
    ports:
      - 8000:8080
    volumes:
      - ./data/:/app/db/
    environment:
      BOT_TOKEN: ${BOT_TOKEN}
      APPLICATION_ID: 970956137157492786
      APP_BOT_SECRET: ${APP_BOT_SECRET}
      DATABASE_URL: file:db/prod.db
```

```sh
docker compose up -d
```
