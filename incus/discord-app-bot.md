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
DISCORD_APP_BOT_TOKEN=your_token_here
```

`compose.yaml`:

```yaml
name: discord-app-bot

services:
  discord-app-bot:
    container_name: ${COMPOSE_PROJECT_NAME}
    image: ghcr.io/adamhl8/discord-app-bot
    restart: always
    volumes:
      - ./data/:/app/prisma/db/
    environment:
      BOT_TOKEN: ${DISCORD_APP_BOT_TOKEN}
      APPLICATION_ID: 970956137157492786
      DATABASE_URL: file:db/prod.db
```

```sh
docker compose up -d
```
