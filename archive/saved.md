dops:

```sh
curl -Lo ~/bin/dops https://github.com/Mikescher/better-docker-ps/releases/latest/download/dops_linux-amd64-static && chmod +x ~/bin/dops
```

```sh
# get distro
cat /etc/os-release | grep ^ID= | sed "s|^ID=||"
```

```sh
# get distro version name
cat /etc/os-release | grep ^VERSION_CODENAME= | sed "s|^VERSION_CODENAME=||"
```

```sh
sudo mkdir -p /etc/apt/keyrings

curl -fsSL '{gpg_url}' | sudo gpg --dearmor -o /etc/apt/keyrings/{name}.gpg
echo "deb [{arch}signed-by=/etc/apt/keyrings/{name}.gpg] {source}" | sudo tee /etc/apt/sources.list.d/{name}.list > /dev/null
```
