https://discuss.linuxcontainers.org/t/sharing-a-gpu-with-multiple-containers/21913
https://forums.truenas.com/t/add-intel-gpu-support-to-the-incus-lxc-containers-on-25-04/39143

```sh
incus profile create intel-gpu
incus profile device add intel-gpu intel-gpu gpu gid=44 pci=0000:00:02.0
```

```sh
incus launch images:debian/13/cloud jellyfin \
  -p default \
  -p net-br0 \
  -p cloud-init-base \
  -p nas-storage \
  -p intel-gpu \
  -c limits.cpu=2 \
  -d root,size=32GiB
```

> https://www.reddit.com/r/debian/comments/1mm7cjm/so_what_happened_to_intelopenclicd_in_trixie/
> https://github.com/intel/compute-runtime/releases

## intel-opencl-icd

```sh
sudo apt install -y ocl-icd-libopencl1

curl -fsSLO https://github.com/intel/intel-graphics-compiler/releases/download/v2.18.5/intel-igc-core-2_2.18.5+19820_amd64.deb
curl -fsSLO https://github.com/intel/intel-graphics-compiler/releases/download/v2.18.5/intel-igc-opencl-2_2.18.5+19820_amd64.deb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/intel-ocloc-dbgsym_25.35.35096.9-0_amd64.ddeb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/intel-ocloc_25.35.35096.9-0_amd64.deb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/intel-opencl-icd-dbgsym_25.35.35096.9-0_amd64.ddeb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/intel-opencl-icd_25.35.35096.9-0_amd64.deb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/libigdgmm12_22.8.1_amd64.deb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/libze-intel-gpu1-dbgsym_25.35.35096.9-0_amd64.ddeb
curl -fsSLO https://github.com/intel/compute-runtime/releases/download/25.35.35096.9/libze-intel-gpu1_25.35.35096.9-0_amd64.deb

sudo dpkg -i ./*.deb
rm ./*.deb ./*.ddeb
```

## jellyfin

```sh
curl -fsSLo ~/jellyfin-server.deb 'https://repo.jellyfin.org/files/server/debian/latest-preview/amd64/jellyfin-server_10.11.0-rc8+deb13_amd64.deb'
curl -fsSLo ~/jellyfin-web.deb 'https://repo.jellyfin.org/files/server/debian/latest-preview/amd64/jellyfin-web_10.11.0-rc8+deb13_all.deb'
curl -fsSLo ~/jellyfin-ffmpeg.deb 'https://repo.jellyfin.org/files/ffmpeg/debian/latest-7.x/amd64/jellyfin-ffmpeg7_7.1.2-2-trixie_amd64.deb'
sudo apt install -y ~/jellyfin-server.deb ~/jellyfin-web.deb ~/jellyfin-ffmpeg.deb
rm ~/jellyfin-server.deb ~/jellyfin-web.deb ~/jellyfin-ffmpeg.deb
```

```sh
sudo usermod -aG video jellyfin
sudo systemctl restart jellyfin
```
