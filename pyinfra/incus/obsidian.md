> https://obsidian.md/help/sync/headless

```sh
incus launch images:debian/13/cloud obsidian \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```sh
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
sudo apt install -y nodejs
sudo npm install -g obsidian-headless
```

```sh
mkdir -p /nas/storage/Obsidian
ob login
ob sync-list-remote
ob sync-setup --vault obsidian --path /nas/storage/Obsidian --device-name homelab
ob sync --path /nas/storage/Obsidian
```

`/etc/systemd/system/obsidian-sync.service`:

```
[Unit]
Description=obsidian-sync
After=network-online.target
Wants=network-online.target

[Service]
User=adam
Type=exec
ExecStart=/usr/bin/ob sync --continuous --path /nas/storage/Obsidian
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now obsidian-sync
```

## obsidian-web-mcp

> https://github.com/jimprosser/obsidian-web-mcp

```sh
sudo apt install -y git
curl -LsSf https://astral.sh/uv/install.sh | sh
git clone --branch v0.4.0 https://github.com/jimprosser/obsidian-web-mcp.git ~/obsidian-web-mcp
cd ~/obsidian-web-mcp && ~/.local/bin/uv sync
mkdir -p ~/.config ~/.local/share/vault-mcp
```

`/home/adam/.config/vault-mcp.env`:

```
VAULT_PATH=/nas/storage/Obsidian
VAULT_MCP_HOST=0.0.0.0
VAULT_MCP_PORT=8000
VAULT_MCP_PUBLIC_URL=https://obsidian-mcp.adamhl.dev
VAULT_MCP_ALLOWED_HOSTS=obsidian-mcp.adamhl.dev
VAULT_MCP_FORWARDED_ALLOW_IPS=10.8.8.4
VAULT_AUDIT_LOG_PATH=/home/adam/.local/share/vault-mcp/audit.log
VAULT_OAUTH_USERNAME=adam
VAULT_OAUTH_PASSWORD=value
VAULT_MCP_TOKEN=value
```

```sh
chmod 600 ~/.config/vault-mcp.env
```

`/etc/systemd/system/obsidian-web-mcp.service`:

```
[Unit]
Description=obsidian-web-mcp
After=network-online.target
Wants=network-online.target

[Service]
User=adam
Type=exec
WorkingDirectory=/home/adam/obsidian-web-mcp
EnvironmentFile=/home/adam/.config/vault-mcp.env
ExecStart=/home/adam/.local/bin/uv run vault-mcp
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now obsidian-web-mcp
```

In claude.ai, add a custom connector at Settings -> Connectors with URL `https://obsidian-mcp.adamhl.dev` and sign in with `VAULT_OAUTH_USERNAME` / `VAULT_OAUTH_PASSWORD`.
