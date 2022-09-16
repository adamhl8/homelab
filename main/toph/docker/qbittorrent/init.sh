#!/bin/bash

sops exec-env ~/secrets.env 'envsubst < ~/docker/qbittorrent/wg0.conf | tee ~/docker/qbittorrent/wg0.conf > /dev/null'