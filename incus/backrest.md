```sh
incus launch images:debian/13/cloud backrest \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -c limits.cpu=2 \
  -d root,size=16GiB
```

```sh
mkdir -p ~/bin/
curl -fsSLo backrest.tar.gz https://github.com/garethgeorge/backrest/releases/latest/download/backrest_Linux_x86_64.tar.gz
tar -xzf backrest.tar.gz -C ~/bin/ backrest
rm -f backrest.tar.gz
chmod +x ~/bin/backrest

mkdir -p ~/.backrest

sudo apt install -y jq
curl -fsSL https://api.github.com/repos/garethgeorge/backrest/releases/latest | jq -r '.tag_name' > ~/.backrest/.version
```

`/etc/systemd/system/backrest.service`:

```
[Unit]
Description=Backrest
After=network.target

[Service]
User=adam
Type=exec
ExecStart=/home/adam/bin/backrest
Restart=always
Environment="BACKREST_PORT=0.0.0.0:8000"
Environment="BACKREST_CONFIG=/home/adam/.backrest/config.json"
Environment="BACKREST_DATA=/home/adam/.backrest/data/"
Environment="XDG_CACHE_HOME=/home/adam/.backrest/cache/"

[Install]
WantedBy=multi-user.target
```

`/home/adam/.backrest/config.json`:

```json
{
  "modno": 3,
  "version": 4,
  "instance": "backrest",
  "repos": [
    {
      "id": "b2-adamhl-restic-storage",
      "uri": "s3:s3.us-west-004.backblazeb2.com/adamhl-restic-storage",
      "guid": "9f4db78e0d58c30ddc43eaeb5b5d31b982622a90b6f04f4c07a7f34e536da9d1",
      "env": [
        "AWS_ACCESS_KEY_ID=<value>",
        "AWS_SECRET_ACCESS_KEY=<value>",
        "RESTIC_PASSWORD=<value>",
        "RESTIC_COMPRESSION=max",
        "RESTIC_PACK_SIZE=100"
      ],
      "prunePolicy": {
        "schedule": {
          "cron": "0 4 * * *",
          "clock": "CLOCK_LOCAL"
        },
        "maxUnusedPercent": 1
      },
      "checkPolicy": {
        "schedule": {
          "cron": "0 4 * * *",
          "clock": "CLOCK_LOCAL"
        },
        "readDataSubsetPercent": 0
      },
      "commandPrefix": {}
    }
  ],
  "plans": [
    {
      "id": "b2",
      "repo": "b2-adamhl-restic-storage",
      "paths": ["/nas/storage"],
      "excludes": ["/nas/storage/Media/Downloads"],
      "schedule": {
        "cron": "0 3 * * *",
        "clock": "CLOCK_LOCAL"
      },
      "retention": {
        "policyKeepLastN": 30
      },
      "hooks": [
        {
          "conditions": ["CONDITION_ANY_ERROR", "CONDITION_UNKNOWN"],
          "actionHealthchecks": {
            "webhookUrl": "https://hc-ping.com/2b8ad240-8621-4ab3-b3f3-243a9de92f1d/fail",
            "template": "{{ .Summary }}"
          }
        },
        {
          "conditions": ["CONDITION_SNAPSHOT_SUCCESS"],
          "actionHealthchecks": {
            "webhookUrl": "https://hc-ping.com/2b8ad240-8621-4ab3-b3f3-243a9de92f1d",
            "template": "{{ .Summary }}"
          }
        }
      ]
    }
  ],
  "auth": {
    "disabled": true,
    "users": [
      {
        "name": "adam",
        "passwordBcrypt": "JDJhJDEwJGlCV1p3c2dyUkNmVGg2WkVtdzRXamVlR2xRWjZoZWNabHVzd3R2dXRKd3JaekxqMEVrUHc2"
      }
    ]
  }
}
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now backrest
```
