package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"adamhl8/docker-container-update/utils"

	"github.com/docker/docker/client"
	"github.com/fatih/color"
	"github.com/regclient/regclient"
)

func main() {
	ctx := context.Background()

	dockerClient, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	rc := regclient.New()

	color.Blue("Getting details for running containers...")
	composeToContainersMap, err := utils.GetComposeToContainersMap(ctx, dockerClient)
	if err != nil {
		log.Fatalf("Failed to get details for running containers: %v", err)
	}

COMPOSE_STACKS:
	for _, composeStack := range composeToContainersMap {
		color.Magenta("\n== %s ==", composeStack.Path)

		containersToUpdate := []*utils.ContainerDetails{}

		color.Blue("Checking for updates...")
		for _, containerDetails := range composeStack.Containers {
			err := utils.CheckForContainerUpdate(ctx, dockerClient, rc, containerDetails)
			if err != nil {
				msg := color.RedString("Failed to check for updates for %s", containerDetails.InfoString)
				fmt.Fprintf(os.Stderr, "%s: %v\n", msg, err)
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
			err := utils.PullNewImage(ctx, dockerClient, containerDetails)
			if err != nil {
				msg := color.RedString("Failed to update container %s", containerDetails.InfoString)
				fmt.Fprintf(os.Stderr, "%s: %v\n", msg, err)
				continue COMPOSE_STACKS
			}
			color.Green("Updated %s", containerDetails.InfoString)
		}

		color.Blue("Starting containers...")
		err = utils.StartContainers(composeStack.Path)
		if err != nil {
			msg := color.RedString("Failed to start containers")
			fmt.Fprintf(os.Stderr, "%s: %v\n", msg, err)
			continue
		}
		color.Green("Done!")
	}
}
