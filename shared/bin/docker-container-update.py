#!/usr/bin/env python

# ruff: noqa

import os
from collections import defaultdict

from pathlib import Path
from typing import NamedTuple
from shellrunner import X, ShellCommandError

from hl_helpers import Color, Log

os.environ["SHELLRUNNER_SHOW_OUTPUT"] = "False"
os.environ["SHELLRUNNER_SHOW_COMMAND"] = "False"


class ContainerDetails(NamedTuple):
    image_name: str
    service_name: str
    is_up_to_date: bool
    compose_file_path: Path


def get_running_containers() -> list[tuple[str, str]]:
    containers = X(
        "docker ps --format '{{.ID}}::{{.Image}}'",
    ).out.splitlines()
    return [tuple(container.split("::")) for container in containers]


def get_container_details(container_id: str, image: str) -> ContainerDetails | None:
    try:
        image_id = X(f"docker inspect {container_id}" + " --format '{{.Image}}'").out
        image_digest = X(f"docker image inspect {image_id}" + " --format '{{.RepoDigests}}'").out
        remote_digest = X(f"regctl image digest {image}").out
        is_up_to_date = remote_digest in image_digest

        image_name = X(f"docker inspect {container_id}" + """ --format='{{.Config.Image}}'""").out
        service_name = X(
            f"docker inspect {container_id}" + """ --format '{{ index .Config.Labels "com.docker.compose.service" }}'"""
        ).out
        compose_file = X(
            f"docker inspect {container_id}"
            + """ --format '{{ index .Config.Labels "com.docker.compose.project.config_files" }}'"""
        ).out
        compose_file_path = Path(compose_file).resolve(strict=True)

        return ContainerDetails(image_name, service_name, is_up_to_date, compose_file_path)
    except ShellCommandError as e:
        Log.warn(f"An error occured while getting the details for container: {image} ({container_id})")
        Log.error(e.out)


def main() -> None:
    Log.info("Getting details for running containers...")
    compose_files_to_containers: defaultdict[Path, list[ContainerDetails]] = defaultdict(list)
    for container_id, image in get_running_containers():
        container_details = get_container_details(container_id, image)
        if container_details is None:
            continue

        compose_files_to_containers[container_details.compose_file_path].append(container_details)

    for compose_file_path, containers in compose_files_to_containers.items():
        Log.info(f"\n== {compose_file_path} ==")
        for container in containers:
            status = "Up to date" if container.is_up_to_date else Color.success("Update found")
            print(f"{Color.info(container.service_name)}[{container.image_name}]: {status}")

        for container in containers:
            if not container.is_up_to_date:
                Log.warn(f"Updating {container.service_name}[{container.image_name}]...")
                compose_file_dir = compose_file_path.parent
                X(
                    [
                        f"cd {compose_file_dir}",
                        f"docker pull {container.image_name}",
                        f"docker compose -f {compose_file_path} up -d {container.service_name}",
                    ]
                )


if __name__ == "__main__":
    main()
