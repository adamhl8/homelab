from time import sleep

from shellrunner import X

print("Waiting for docker-cups-airprint to start...")
sleep(3)
X("docker cp /mnt/storage/Stuff/Misc/ts202_driver.deb docker-cups-airprint:/")
X("docker exec -it docker-cups-airprint apt update")
X("docker exec -it docker-cups-airprint apt upgrade -y")
X("docker exec docker-cups-airprint apt install /ts202_driver.deb")
