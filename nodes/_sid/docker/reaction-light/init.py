from shellrunner import X

X(
    "sops exec-env ~/secrets.yaml 'envsubst < ~/docker/reaction-light/config.ini | tee ~/docker/reaction-light/config.ini > /dev/null'",
)
