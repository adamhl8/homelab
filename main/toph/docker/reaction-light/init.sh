#!/bin/bash

sops exec-env ~/secrets.env 'envsubst < ~/docker/reaction-light/config.ini | tee ~/docker/reaction-light/config.ini > /dev/null'
