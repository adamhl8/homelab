#!/bin/bash

read -p "Waiting for docker-cups-airprint to start..." -t 3
echo
docker cp /mnt/storage/Stuff/Misc/ts202_driver.deb docker-cups-airprint:/
docker exec -it docker-cups-airprint apt update
docker exec -it docker-cups-airprint apt upgrade -y
docker exec docker-cups-airprint apt install /ts202_driver.deb
