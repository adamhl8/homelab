#!/usr/bin/env python

from shellrunner import X


def get_running_containers() -> list[tuple[str, str]]:
    containers = X("docker ps --format '{{.ID}}::{{.Image}}'", show_commands=False, show_output=False).out.splitlines()
    return [tuple(container.split("::")) for container in containers]


def update_container(container_id: str, image: str, latest_tag: str) -> None:
    X(f"docker pull {image}:{latest_tag}", show_commands=False, show_output=False)
    X(f"docker stop {container_id}", show_commands=False, show_output=False)
    X(f"docker rm {container_id}", show_commands=False, show_output=False)
    X(f"docker run -d --name {container_id} {image}:{latest_tag}", show_commands=False, show_output=False)


def main() -> None:
    updated_containers: list[tuple[str, str, str]] = []
    for container_id, image in get_running_containers():
        print("========")
        try:
            image_id = X(f"docker inspect {container_id}" + " --format '{{.Image}}'").out
            image_digest = X(f"docker image inspect {image_id}" + " --format '{{.RepoDigests}}'").out
            remote_digest = X(f"./regctl image digest {image}").out
            if remote_digest in image_digest:
                print("WOO!!!")
        except:
            pass
        # X(f"docker inspect {container_id}" + """ --format '{{ index .Config.Labels "com.docker.compose.service" }}'""")
        # X(f"docker inspect {container_id}" + """ --format '{{ index .Config.Labels "com.docker.compose.project.config_files" }}'""")
        # X(f"docker inspect {container_id}" + """ --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}'""")
        # X(f"docker inspect {container_id}" + """ --format '{{ index .Config.Labels "com.docker.compose.project.environment_file" }}'""")
        # X(f"docker inspect {container_id}" + """ --format='{{.Config.Image}}'""")
        print("========")

    # print("\nUpdated containers:")
    # for container_id, image, tag in updated_containers:
    #     print(f"{container_id}: {image}:{tag}")

if __name__ == "__main__":
    main()
