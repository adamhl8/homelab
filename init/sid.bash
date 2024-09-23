shared="${shared:?}"

echo 'APT::Get::Update::SourceListWarnings::NonFreeFirmware "false";' | sudo tee /etc/apt/apt.conf.d/no-bookworm-firmware.conf > /dev/null
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y
echo "Updated system. System should be rebooted."

# shellcheck source=./shared/homebrew.bash
source "${shared}/homebrew.bash"
# shellcheck source=./shared/rye.bash
source "${shared}/rye.bash"
# shellcheck source=./shared/shellrunner.bash
source "${shared}/shellrunner.bash"
