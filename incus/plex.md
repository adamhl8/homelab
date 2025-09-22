https://discuss.linuxcontainers.org/t/sharing-a-gpu-with-multiple-containers/21913
https://forums.truenas.com/t/add-intel-gpu-support-to-the-incus-lxc-containers-on-25-04/39143

```sh
incus profile create intel-gpu
incus profile device add intel-gpu intel-gpu gpu gid=44 pci=0000:00:02.0
```

```sh
incus launch images:debian/13/cloud plex \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -p intel-gpu \
  -c limits.cpu=2 \
  -d root,size=32GiB
```

```sh
sudo usermod -aG video adam
```

```sh
sudo apt install -y va-driver-all ocl-icd-libopencl1 vainfo intel-gpu-tools wget
curl -fsSL https://downloads.plex.tv/plex-keys/PlexSign.key | sudo gpg --dearmor -o /usr/share/keyrings/plex.gpg
echo 'deb [signed-by=/usr/share/keyrings/plex.gpg] https://downloads.plex.tv/repo/deb/ public main' | sudo tee /etc/apt/sources.list.d/plexmediaserver.list > /dev/null
sudo apt update && sudo apt install plexmediaserver -y
```
