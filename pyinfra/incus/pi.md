```sh
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y
sudo systemctl reboot
sudo sed -i -r 's|^(FIRMWARE_RELEASE_STATUS=).+|\1"latest"|' /etc/default/rpi-eeprom-update
sudo rpi-eeprom-update -a
```

Set up sshd

Set up tailscale according to [tailscale.md](./tailscale.md)

```sh
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/plucky.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg > /dev/null
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/plucky.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt update && sudo apt install -y tailscale
sudo tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16
```
