```sh
sudo apt install -y msmtp
```

`/etc/msmtprc`:

```
defaults
auth            on
tls             on
tls_trust_file  /etc/ssl/certs/ca-certificates.crt
logfile         /var/log/msmtp

# SES
account        ses
host           email-smtp.us-east-1.amazonaws.com
port           587
tls_starttls   on
from           incus@adamhl.dev
user           <ses_smtp_id>
password       <ses_smtp_password>

account default: ses
```

Test with:

```sh
printf "Subject: Test\n\nhello world" | sudo msmtp <recipient>
```

`/etc/zfs/zed.d/zed.rc`:

```sh
ZED_EMAIL_ADDR="adamhl@pm.me"
ZED_EMAIL_PROG="msmtp"
ZED_EMAIL_OPTS="-f zfs-zed@adamhl.dev @ADDRESS@"
ZED_NOTIFY_INTERVAL_SECS=86400 # 1 day
#ZED_NOTIFY_VERBOSE=1
ZED_SCRUB_AFTER_RESILVER=1
```

```sh
sudo systemctl restart zed
```

`/etc/systemd/system/zfs-scrub@.service`:

```
[Unit]
Description=ZFS scrub on %i
Requires=zfs.target
After=zfs.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/zpool scrub %i
```

`/etc/systemd/system/zfs-scrub@.timer`:

```
[Unit]
Description=Weekly ZFS scrub on %i

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now zfs-scrub@POOL_NAME.timer
```

Validate timers:

```sh
sudo systemctl list-timers zfs-scrub@*
```
