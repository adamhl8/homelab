# https://discussion.scottibyte.com/t/self-hosted-unifi-os-in-an-incus-container/673

```sh
incus launch images:debian/13/cloud unifi \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -c limits.cpu=2 \
  -d root,size=24GiB \
  -c security.nesting=true \
  -c security.privileged=true \
  -c security.syscalls.intercept.sysinfo=true \
  -c raw.lxc="lxc.mount.auto = proc:rw sys:rw"
```

# https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi

```sh
sudo apt install -y jq podman slirp4netns

unifi_os_server_download_url=$(curl -fsS https://download.svc.ui.com/v1/software-downloads \
  | jq -r '[.downloads[] | select(.slug | test("unifi-os-server-[0-9.]+-for-linux-\\(x64\\)"))] | sort_by(.date_published) | last | .file_path')
echo "Downloading UniFi OS Server..."
curl -fsSLo ~/unifi_os_server-installer "${unifi_os_server_download_url}"
chmod +x ~/unifi_os_server-installer
sudo ~/unifi_os_server-installer
sudo systemctl enable uosserver
```

```sh
rm ~/unifi_os_server-installer
sudo usermod -aG uosserver ${USER}
```
