ssh root@<tailscale-ip>

on proxmox host:

append to /etc/pve/lxc/<backrest-lxc-id>.conf

```
mp0: /nas/storage,mp=/nas/storage
```

/etc/pve/lxc/<backrest-lxc-id>.conf

```
lxc.idmap = u 0 100000 1000
lxc.idmap = g 0 100000 1000
lxc.idmap = u 1000 1000 1
lxc.idmap = g 1000 1000 1
lxc.idmap = u 1001 101001 64535
lxc.idmap = g 1001 101001 64535
```

apt update && apt full-upgrade -y && apt autoremove -y
apt install curl -y

dpkg-reconfigure tzdata

curl -Lo /root/backrest.tar.gz https://github.com/garethgeorge/backrest/releases/latest/download/backrest_Linux_x86_64.tar.gz
tar -xzf /root/backrest.tar.gz backrest
chown root:root backrest
chmod +x backrest
mkdir -p /root/bin
mv backrest /root/bin/backrest
rm -f backrest.tar.gz

mkdir -p /root/backrest

/etc/systemd/system/backrest.service

```
[Unit]
Description=Backrest
After=network.target

[Service]
Type=simple
ExecStart=/root/bin/backrest
Environment="BACKREST_PORT=0.0.0.0:8000"
Environment="BACKREST_CONFIG=/root/backrest/config.json"
Environment="BACKREST_DATA=/root/backrest/data/"
Environment="XDG_CACHE_HOME=/root/backrest/cache/"

[Install]
WantedBy=multi-user.target
```

/root/backrest/config.json

```
{
  "modno":  1,
  "version":  3,
  "instance":  "backrest",
  "repos":  [
    {
      "id":  "b2-adamhl-restic-storage",
      "uri":  "s3:s3.us-west-004.backblazeb2.com/adamhl-restic-storage",
      "env":  [
        "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}",
        "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}",
        "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}",
        "RESTIC_COMPRESSION=max",
        "RESTIC_PACK_SIZE=100",
        "RESTIC_PASSWORD=${RESTIC_PASSWORD}"
      ],
      "prunePolicy":  {
        "schedule":  {
          "cron":  "0 4 * * *",
          "clock":  "CLOCK_LOCAL"
        },
        "maxUnusedPercent":  1
      },
      "checkPolicy":  {
        "schedule":  {
          "cron":  "0 4 * * *",
          "clock":  "CLOCK_LOCAL"
        },
        "readDataSubsetPercent":  10
      },
      "commandPrefix":  {}
    }
  ],
  "plans":  [
    {
      "id":  "b2",
      "repo":  "b2-adamhl-restic-storage",
      "paths":  [
        "/nas/storage"
      ],
      "schedule":  {
        "disabled":  true,
        "clock":  "CLOCK_LOCAL"
      },
      "retention":  {
        "policyKeepLastN":  30
      },
      "hooks":  [
        {
          "conditions":  [
            "CONDITION_ANY_ERROR",
            "CONDITION_UNKNOWN"
          ],
          "actionHealthchecks":  {
            "webhookUrl":  "https://hc-ping.com/2b8ad240-8621-4ab3-b3f3-243a9de92f1d/fail",
            "template":  "{{ .Summary }}"
          }
        },
        {
          "conditions":  [
            "CONDITION_SNAPSHOT_SUCCESS"
          ],
          "actionHealthchecks":  {
            "webhookUrl":  "https://hc-ping.com/2b8ad240-8621-4ab3-b3f3-243a9de92f1d",
            "template":  "{{ .Summary }}"
          }
        }
      ]
    }
  ],
  "auth":  {
    "disabled":  true,
    "users":  [
      {
        "name":  "adam",
        "passwordBcrypt":  "JDJhJDEwJGlCV1p3c2dyUkNmVGg2WkVtdzRXamVlR2xRWjZoZWNabHVzd3R2dXRKd3JaekxqMEVrUHc2"
      }
    ]
  }
}
```

systemctl daemon-reload
systemctl enable backrest
systemctl start backrest
