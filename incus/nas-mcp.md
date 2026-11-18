> https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
>
> https://github.com/microsoft/markitdown/tree/main/packages/markitdown-mcp
>
> https://github.com/sparfenyuk/mcp-proxy

```sh
incus launch images:debian/13/cloud nas-mcp \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=1 \
  -d root,size=16GiB
```

```sh
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo bash -
sudo apt install -y nodejs nftables
sudo npm install -g @modelcontextprotocol/server-filesystem@2.0.0
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Install the Python tools system-wide so the `markitdown` user can run them.

```sh
sudo useradd --system --home-dir /nonexistent --shell /usr/sbin/nologin markitdown
sudo env UV_TOOL_DIR=/opt/uv/tools UV_TOOL_BIN_DIR=/usr/local/bin UV_PYTHON_INSTALL_DIR=/opt/uv/python ~/.local/bin/uv tool install mcp-proxy==0.13.0
sudo env UV_TOOL_DIR=/opt/uv/tools UV_TOOL_BIN_DIR=/usr/local/bin UV_PYTHON_INSTALL_DIR=/opt/uv/python ~/.local/bin/uv tool install markitdown-mcp==0.0.1a8
```

`mcp-proxy` has no auth, so only Caddy may reach its ports.
`markitdown-mcp` also fetches http(s) URLs, so the `markitdown` user may not open connections.

`/etc/nftables.conf`:

```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
	chain input {
		type filter hook input priority 0; policy accept;
		tcp dport { 8000, 8001 } ip saddr 10.8.8.4 accept
		tcp dport { 8000, 8001 } drop
	}
	chain output {
		type filter hook output priority 0; policy accept;
		meta skuid "markitdown" ct state new drop
	}
}
```

```sh
sudo systemctl enable --now nftables
```

`/etc/systemd/system/nas-mcp.service`:

```
[Unit]
Description=nas-mcp
After=network-online.target
Wants=network-online.target

[Service]
User=adam
Type=exec
ExecStart=/usr/local/bin/mcp-proxy --host=0.0.0.0 --port=8000 -- /usr/bin/node /usr/lib/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js /nas/storage
Restart=always

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/nas-docs.service`:

```
[Unit]
Description=nas-docs
After=network-online.target
Wants=network-online.target

[Service]
User=markitdown
Type=exec
ExecStart=/usr/local/bin/mcp-proxy --host=0.0.0.0 --port=8001 -- /usr/local/bin/markitdown-mcp
Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now nas-mcp nas-docs
```

Caddy only proxies requests that carry the matching `Authorization: Bearer` token (see `caddy.md`), so each token is its connector's only credential.

In claude.ai, add two custom connectors at Settings -> Connectors, both with "No sign-in":

- NAS: URL `https://nas-mcp.adamhl.dev/mcp`, request header `authorization` set to `Bearer <NAS_MCP_TOKEN>`.
- NAS Documents: URL `https://nas-docs.adamhl.dev/mcp`, request header `authorization` set to `Bearer <NAS_DOCS_TOKEN>`. It reads documents as Markdown from `file:///nas/storage/...` URIs.
