ssh -q -t root@pve.lan 'bash -l -c "pct create 113 local:vztmpl/debian-12-standard_12.7-1_amd64.tar.zst \
 --hostname kan \
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

ssh -q -t root@pve.lan 'bash -l -c "pct start 113"'

ssh -q -t root@kan.lan 'bash -l -c "apt update && apt full-upgrade -y && apt autoremove -y"'
ssh -q -t root@kan.lan 'bash -l -c "apt install curl ca-certificates -y"'
ssh -q -t root@kan.lan 'bash -l -c "dpkg-reconfigure tzdata"'

curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
apt update
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

mkdir -p ~/kan/

~/kan/compose.yaml

```yaml
services:
  kan:
    container_name: kan
    image: ghcr.io/kanbn/kan:latest
    restart: always
    ports:
      - 8000:3000
    environment:
      POSTGRES_URL: postgresql://kan:kan@postgres:5432/kan
      NEXT_PUBLIC_BASE_URL: https://kan.adamhl.dev
      BETTER_AUTH_SECRET: $(openssl rand -base64 32)
      GITHUB_CLIENT_ID: <your_client_id>
      GITHUB_CLIENT_SECRET: <your_client_secret>
    depends_on:
      - postgres

  postgres:
    container_name: kan-postgres
    image: postgres:15
    restart: always
    volumes:
      - ./postgres/:/var/lib/postgresql/data/
    environment:
      POSTGRES_DB: kan
      POSTGRES_USER: kan
      POSTGRES_PASSWORD: kan
```

docker compose pull
docker compose up -d
