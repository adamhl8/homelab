from shellrunner import X

X("docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16")
