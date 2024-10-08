package main

import (
	"fmt"
	"log"

	"adamhl8/docker-container-update/utils"

	"github.com/docker/docker/client"
	"github.com/fatih/color"
	"github.com/regclient/regclient"
)

func main() {
	dockerClient, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	rc := regclient.New()

	color.Blue("Getting details for running containers...")
	composeToContainersMap, err := utils.GetComposeContainersMap(dockerClient)
	if err != nil {
		color.Red("Error: failed to get details for running containers")
		log.Fatalln(err)
	}

COMPOSE_STACKS:
	for composeFilePath, containers := range composeToContainersMap {
		color.Magenta("\n== %s ==", composeFilePath)

		containersToUpdate := []*utils.ContainerDetails{}

		color.Blue("Checking for updates...")
		for _, containerDetails := range containers {
			err := utils.CheckForContainerUpdate(dockerClient, rc, containerDetails)
			if err != nil {
				color.Red("Error: failed to check for updates for %s", utils.GetContainerInfoString(containerDetails))
				fmt.Println(err)
				continue COMPOSE_STACKS
			}

			if !containerDetails.IsUpToDate {
				containersToUpdate = append(containersToUpdate, containerDetails)
			}

			utils.PrintContainerUpdateDetails(containerDetails)
		}

		if len(containersToUpdate) == 0 {
			color.Green("All containers are up to date")
			continue
		}

		color.Blue("Updating containers...")
		for _, containerDetails := range containersToUpdate {
			err := utils.PullNewImage(dockerClient, containerDetails)
			if err != nil {
				color.Red("Error: failed to pull new image for %s", utils.GetContainerInfoString(containerDetails))
				fmt.Println(err)
				continue COMPOSE_STACKS
			}
			color.Green("Updated %s", utils.GetContainerInfoString(containerDetails))
		}

		color.Blue("Starting containers...")
		err = utils.StartContainers(composeFilePath)
		if err != nil {
			color.Red("Error: failed to start containers")
			fmt.Println(err)
			continue
		}
		color.Green("Done!")
	}
}
