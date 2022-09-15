#!/bin/bash

sops exec-env ~/homelab/secrets.env 'envsubst < ~/docker/caddy/users.json > /dev/null'