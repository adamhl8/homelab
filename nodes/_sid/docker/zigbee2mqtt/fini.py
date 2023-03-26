from time import sleep

from shellrunner import X

print("Waiting for Zigbee2MQTT to start...")
sleep(5)

X("sudo ln -s -f ~/docker/zigbee2mqtt/zigbee2mqtt_config.yaml ~/docker/zigbee2mqtt/data/zigbee2mqtt/configuration.yaml")
X("docker restart zigbee2mqtt")
