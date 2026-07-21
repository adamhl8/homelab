> https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html

```sh
sudo apt install -y samba smbclient
```

`/etc/samba/smb.conf`:

```
[global]
  server role = standalone server
  workgroup = WORKGROUP

  interfaces = lo 10.8.8.0/24
  bind interfaces only = yes
  hosts allow = 10.8.8.0/24 127.0.0.1

  server min protocol = SMB3_00
  smb ports = 445
  # samba 4.23+ replaces `smb ports` with:
  # server smb transports = tcp
  disable netbios = yes
  restrict anonymous = 2

  # disable printing
  printing = bsd
  load printers = no
  printcap name = /dev/null
  disable spoolss = yes

  logging = systemd
  log level = 1

  use sendfile = yes
  # zero-copy writes above this size
  min receivefile size = 16384

[storage]
  path = /nas/storage
  valid users = adam
  read only = no

  create mask = 0644
  force create mode = 0644
  directory mask = 0755
  force directory mode = 0755
```

```sh
sudo smbpasswd -a adam
```

```sh
testparm -s
sudo systemctl enable --now smbd
sudo systemctl mask --now nmbd
```
