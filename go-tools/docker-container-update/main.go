package main

import (
	"context"
	"fmt"
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
	defer dockerClient.Close()

	regclient := regclient.New()

	color.Blue("Getting details for running containers...")

	composeStacks, err := utils.GetComposeStacks(ctx, dockerClient)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to get details for running containers: %v\n", err)

		return
	}

	if len(composeStacks) == 0 {
		color.Yellow("No docker compose stacks found")

		return
	}

	for _, composeStack := range composeStacks {
		color.Magenta("\n== %s ==", composeStack.Path)

		err := updateStack(ctx, dockerClient, regclient, composeStack)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to update stack: %v\n", err)

			continue
		}
	}
}

func updateStack(
	ctx context.Context,
	dockerClient *client.Client,
	regclient *regclient.RegClient,
	composeStack *utils.ComposeStack,
) error {
	containersToUpdate := []*utils.ContainerDetails{}

	color.Blue("Checking for updates...")

	for _, containerDetails := range composeStack.Containers {
		err := utils.CheckForContainerUpdate(ctx, dockerClient, regclient, containerDetails)
		if err != nil {
			return fmt.Errorf("failed to check for updates for %s: %w", containerDetails.InfoString, err)
		}

		if !containerDetails.IsUpToDate {
			containersToUpdate = append(containersToUpdate, containerDetails)
		}

		utils.PrintContainerUpdateDetails(containerDetails)
	}

	if len(containersToUpdate) == 0 {
		color.Green("All containers are up to date")

		return nil
	}

	color.Blue("\nUpdating containers...")

	for _, containerDetails := range containersToUpdate {
		err := utils.PullNewImage(ctx, dockerClient, containerDetails)
		if err != nil {
			return fmt.Errorf("failed to update container %s: %w", containerDetails.InfoString, err)
		}

		color.Green("Updated %s", containerDetails.InfoString)
	}

	color.Blue("Starting containers...")

	err := utils.StartContainers(composeStack.Path)
	if err != nil {
		return fmt.Errorf("failed to start containers: %w", err)
	}

	color.Green("Done!")

	return nil
}
