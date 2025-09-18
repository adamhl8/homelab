```sh
incus launch images:debian/13/cloud rybbit \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p docker \
  -c limits.cpu=2 \
  -c limits.memory=4GiB \
  -d root,size=16GiB
```

`.env`:

```
BASE_URL=https://rybbit.adamhl.dev
BETTER_AUTH_SECRET=openssl rand -hex 32
DISABLE_SIGNUP=true
CLICKHOUSE_DB=analytics
CLICKHOUSE_PASSWORD=frog
POSTGRES_DB=analytics
POSTGRES_USER=frog
POSTGRES_PASSWORD=frog
```

`compose.yaml`:

```yaml
name: rybbit

services:
  client:
    container_name: ${COMPOSE_PROJECT_NAME}-client
    image: ghcr.io/rybbit-io/rybbit-client
    restart: always
    build:
      context: ./rybbit-repo
      dockerfile: client/Dockerfile
      args:
        NEXT_PUBLIC_BACKEND_URL: ${BASE_URL}
        NEXT_PUBLIC_DISABLE_SIGNUP: ${DISABLE_SIGNUP}
    ports:
      - 8000:3002
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BACKEND_URL=${BASE_URL}
      - NEXT_PUBLIC_DISABLE_SIGNUP=${DISABLE_SIGNUP}
    depends_on:
      - backend

  backend:
    container_name: ${COMPOSE_PROJECT_NAME}-backend
    image: ghcr.io/rybbit-io/rybbit-backend
    restart: always
    build:
      context: ./rybbit-repo
      dockerfile: server/Dockerfile
    ports:
      - 8001:3001
    environment:
      - NODE_ENV=production
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BASE_URL=${BASE_URL}
      - DISABLE_SIGNUP=${DISABLE_SIGNUP}
      - CLICKHOUSE_HOST=http://clickhouse:8123
      - CLICKHOUSE_DB=${CLICKHOUSE_DB}
      - CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD}
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      clickhouse:
        condition: service_healthy
      postgres:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3001/api/health"]
      interval: 3s
      timeout: 5s
      retries: 5
      start_period: 10s

  clickhouse:
    container_name: ${COMPOSE_PROJECT_NAME}-clickhouse
    image: clickhouse/clickhouse-server:25.4.2
    restart: always
    volumes:
      - clickhouse:/var/lib/clickhouse/
    configs:
      - source: clickhouse_network
        target: /etc/clickhouse-server/config.d/network.xml
      - source: clickhouse_json
        target: /etc/clickhouse-server/config.d/enable_json.xml
      - source: clickhouse_logging
        target: /etc/clickhouse-server/config.d/logging_rules.xml
      - source: clickhouse_user_logging
        target: /etc/clickhouse-server/config.d/user_logging.xml
    environment:
      - CLICKHOUSE_DB=${CLICKHOUSE_DB}
      - CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8123/ping"]
      interval: 3s
      timeout: 5s
      retries: 5
      start_period: 10s

  postgres:
    container_name: ${COMPOSE_PROJECT_NAME}-postgres
    image: postgres:17.4
    restart: always
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres:/var/lib/postgresql/data/
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 3s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  clickhouse:
  postgres:
  redis:

configs:
  clickhouse_network:
    content: |
      <clickhouse>
          <listen_host>0.0.0.0</listen_host>
      </clickhouse>

  clickhouse_json:
    content: |
      <clickhouse>
          <settings>
              <enable_json_type>1</enable_json_type>
          </settings>
      </clickhouse>

  clickhouse_logging:
    content: |
      <clickhouse>
        <logger>
            <level>warning</level>
            <console>true</console>
        </logger>
        <query_thread_log remove="remove"/>
        <query_log remove="remove"/>
        <text_log remove="remove"/>
        <trace_log remove="remove"/>
        <metric_log remove="remove"/>
        <asynchronous_metric_log remove="remove"/>
        <session_log remove="remove"/>
        <part_log remove="remove"/>
        <latency_log remove="remove"/>
        <processors_profile_log remove="remove"/>
      </clickhouse>

  clickhouse_user_logging:
    content: |
      <clickhouse>
        <profiles>
          <default>
            <log_queries>0</log_queries>
            <log_query_threads>0</log_query_threads>
            <log_processors_profiles>0</log_processors_profiles>
          </default>
        </profiles>
      </clickhouse>
```

```sh
git clone --depth=1 https://github.com/rybbit-io/rybbit.git rybbit-repo
```

```sh
docker compose up -d --build
```
