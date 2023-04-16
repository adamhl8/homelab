#!/usr/bin/env python

from pathlib import Path

from hl_helpers import warn
from shellrunner import X


def update(service_dir: Path, current: str, latest: str, docker_flags: str = ""):
    name = service_dir.name
    docker_flags = f"-d --force-recreate {docker_flags}"
    if current != latest:
        print(f"Updating {name}...")
        X(f"docker compose --project-directory {service_dir} up {docker_flags}", show_commands=False, show_output=False)
        print(f"Updated {name}")
    else:
        print(f"{name} is up to date.")


def caddy(service_dir: Path):
    current = X("docker exec caddy caddy version", show_commands=False, show_output=False).out.split()[0]
    latest = X(
        "curl -s https://api.github.com/repos/caddyserver/caddy/releases/latest | yq '.tag_name'",
        show_commands=False,
        show_output=False,
    ).out
    update(service_dir, current, latest, "--build")


def main():
    for d in sorted((Path.home() / "docker").glob("*")):
        name = d.name
        compose = d / "docker-compose.yml"
        if not compose.is_file():
            warn(f'Could not find docker-compose.yml for "{name}"')
            continue

        print(f"\n==== {name} ====")
        if name == "caddy":
            caddy(d)
            continue

        image_names = X(f"yq '.services.*.image' < {compose}", show_commands=False, show_output=False).out.splitlines()
        for full_image_name in image_names:
            image_name = full_image_name.split(":")[0]  # remove tag
            images = X(
                f"docker compose --project-directory {d} images | grep ' {image_name} ' || [ $status -eq 1 ]",
                show_commands=False,
                show_output=False,
            ).out
            if not images:
                warn(f'Could not get "{image_name}" from "docker compose images" output')
                continue
            old_id = images.split()[3]

            print(f"Checking for updates for {image_name}...")
            X(f"docker compose --project-directory {d} pull -q", show_commands=False, show_output=False)

            images = X(f"docker images {full_image_name}", show_commands=False, show_output=False).out.splitlines()
            if len(images) <= 1:
                warn(f'Could not get "{image_name}" from "docker images" output')
                continue
            new_id = images[1].split()[2]

            update(d, old_id, new_id)

    response = input("Cleanup Docker? (docker system prune -a --volumes -f) [Y/n] ")
    if response.lower() != "n":
        X("docker system prune -a --volumes -f")


if __name__ == "__main__":
    main()
