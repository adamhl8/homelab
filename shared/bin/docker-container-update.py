#!/usr/bin/env python


import json
import os
from collections import defaultdict
from pathlib import Path
from typing import NamedTuple

from hl_helpers import Color, Log
from shellrunner import ShellCommandError, X

os.environ["SHELLRUNNER_SHOW_OUTPUT"] = "False"
os.environ["SHELLRUNNER_SHOW_COMMAND"] = "False"


class ContainerDetails(NamedTuple):
    image_name: str
    service_name: str
    compose_file_path: Path
    build: bool
    is_up_to_date: bool


def get_running_containers() -> list[tuple[str, ...]]:
    containers = X(
        "docker ps --format '{{.ID}}::{{.Image}}'",
    ).out.splitlines()
    return [tuple(container.split("::")) for container in containers]


def get_container_details(container_id: str, image: str) -> ContainerDetails | None:
    try:
        image_name = X(f"docker inspect {container_id}" + """ --format='{{.Config.Image}}'""").out
        service_name = X(
            f"docker inspect {container_id}" """ --format '{{ index .Config.Labels "com.docker.compose.service" }}'""",
        ).out
        compose_file = X(
            f"docker inspect {container_id}"
            """ --format '{{ index .Config.Labels "com.docker.compose.project.config_files" }}'""",
        ).out
        compose_file_path = Path(compose_file).resolve(strict=True)

        compose_config = X(f"docker compose -f {compose_file_path} config --format json").out
        compose_config = json.loads(compose_config)
        build = "build" in compose_config["services"][service_name]

        is_up_to_date = False
        if not build:
            image_id = X(f"docker inspect {container_id}" + " --format '{{.Image}}'").out
            image_digest = X(f"docker image inspect {image_id}" + " --format '{{.RepoDigests}}'").out
            remote_digest = X(f"regctl image digest {image}").out
            is_up_to_date = remote_digest in image_digest

        return ContainerDetails(image_name, service_name, compose_file_path, build, is_up_to_date)
    except ShellCommandError as e:
        Log.warn(f"An error occured while getting the details for container: {image} ({container_id})")
        Log.error(e.out)


def build_compose_files_to_containers(
    running_containers: list[tuple[str, ...]],
) -> defaultdict[Path, list[ContainerDetails]]:
    compose_files_to_containers: defaultdict[Path, list[ContainerDetails]] = defaultdict(list)
    for container_id, image in running_containers:
        container_details = get_container_details(container_id, image)
        if container_details is None:
            continue

        compose_files_to_containers[container_details.compose_file_path].append(container_details)

    return compose_files_to_containers


def print_container_update_details(container: ContainerDetails) -> None:
    status = ""
    if container.build:
        status = Color.warn("Build")
    elif container.is_up_to_date:
        status = "Up to date"
    else:
        status = Color.success("Update found")

    print(f"{Color.info(container.service_name)}[{container.image_name}]: {status}")


def update_container(container: ContainerDetails) -> None:
    compose_file_dir = container.compose_file_path.parent
    if container.build:
        Log.info(f"Building {container.service_name}[{container.image_name}]...")
        X(
            [
                f"cd {compose_file_dir}",
                f"docker compose -f {container.compose_file_path} build --no-cache --pull {container.service_name}",
                f"docker compose -f {container.compose_file_path} up -d {container.service_name}",
            ],
        )
    elif not container.is_up_to_date:
        Log.info(f"Updating {container.service_name}[{container.image_name}]...")
        X(
            [
                f"cd {compose_file_dir}",
                f"docker pull {container.image_name}",
                f"docker compose -f {container.compose_file_path} up -d {container.service_name}",
            ],
        )


def main() -> None:
    Log.info("Getting details for running containers...")
    running_containers = get_running_containers()
    compose_files_to_containers = build_compose_files_to_containers(running_containers)

    for compose_file_path, containers in compose_files_to_containers.items():
        Log.notice(f"\n== {compose_file_path} ==")
        for container in containers:
            print_container_update_details(container)
        for container in containers:
            update_container(container)


if __name__ == "__main__":
    main()
