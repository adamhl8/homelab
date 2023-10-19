from shellrunner import X


def main():
    X("docker exec tailscale tailscale up --advertise-exit-node --advertise-routes=10.8.0.0/16")


if __name__ == "__main__":
    main()
