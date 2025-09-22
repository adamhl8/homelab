```sh
incus launch images:debian/13/cloud unifi \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

```sh
sudo apt install -y jq
```

```sh
curl -fsSL https://apt.corretto.aws/corretto.key | sudo gpg --dearmor -o /usr/share/keyrings/corretto-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/corretto-keyring.gpg] https://apt.corretto.aws stable main" | sudo tee /etc/apt/sources.list.d/corretto.list
sudo apt update && sudo apt install -y java-21-amazon-corretto-jdk
```

```sh
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt install -y mongodb-org
```

```sh
unifi_version=$(curl -fsS -X POST https://community.svc.ui.com/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetLatestRelease($tags: [String!], $limit: Int, $sortBy: ReleasesSortBy, $searchTerm: String) { releases(tags: $tags, limit: $limit, sortBy: $sortBy, searchTerm: $searchTerm) { items { title version } } }",
    "variables": {
      "limit": 1,
      "sortBy": "LATEST",
      "tags": ["unifi-network"],
      "searchTerm": "UniFi Network Application"
    },
    "operationName": "GetLatestRelease"
  }' | jq -r '.data.releases.items[] | select(.title == "UniFi Network Application") | .version')
echo "Downloading UniFi Network Application v${unifi_version}..."
curl -fsSLo ~/unifi.deb "https://dl.ui.com/unifi/${unifi_version}/unifi_sysvinit_all.deb"
sudo apt install -y ~/unifi.deb && rm ~/unifi.deb
```

```sh
sudo sed -i -r 's|# (unifi\.https\.port=).+|\18000|' /usr/lib/unifi/data/system.properties
sudo systemctl restart unifi
```
