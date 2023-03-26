from time import sleep

from shellrunner import X

print("Waiting for Home Assistant to start...")
sleep(5)
X(
    "cat ~/docker/homeassistant/http_config.yaml | sudo tee -a ~/docker/homeassistant/data/configuration.yaml > /dev/null",
)
X("docker restart homeassistant")
