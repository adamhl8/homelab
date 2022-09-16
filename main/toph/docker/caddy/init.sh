#!/bin/bash

sops exec-env ~/secrets.env 'envsubst < ~/docker/caddy/users.json | tee ~/docker/caddy/users.json > /dev/null'