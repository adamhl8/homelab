package utils

import (
	"context"
	"fmt"
	"os/exec"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/fatih/color"
	"github.com/regclient/regclient"
	"github.com/regclient/regclient/types/ref"
)

type ContainerDetails struct {
	ImageID         string
	Image           string
	ServiceName     string
	ComposeFilePath string
	IsUpToDate      bool
}

func GetComposeContainersMap(dockerClient *client.Client) (map[string][]*ContainerDetails, error) {
	containers, err := dockerClient.ContainerList(context.Background(), container.ListOptions{})
	if err != nil {
		return nil, err
	}

	composeToContainersMap := make(map[string][]*ContainerDetails)

	for _, container := range containers {
		containerDetails := ContainerDetails{
			ImageID:         container.ImageID,
			Image:           container.Image,
			ServiceName:     container.Labels["com.docker.compose.service"],
			ComposeFilePath: container.Labels["com.docker.compose.project.config_files"],
			IsUpToDate:      true,
		}
		composeToContainersMap[containerDetails.ComposeFilePath] = append(composeToContainersMap[containerDetails.ComposeFilePath], &containerDetails)
	}

	return composeToContainersMap, nil
}

func CheckForContainerUpdate(dockerClient *client.Client, rc *regclient.RegClient, containerDetails *ContainerDetails) error {
	localImageDigest, err := getLocalImageDigest(dockerClient, containerDetails)
	if err != nil {
		return err
	}

	remoteImageDigest, err := getRemoteImageDigest(rc, containerDetails)
	if err != nil {
		return err
	}

	containerDetails.IsUpToDate = strings.Contains(localImageDigest, remoteImageDigest)

	return nil
}

func GetContainerInfoString(containerDetails *ContainerDetails) string {
	return fmt.Sprintf("%s[%s]", color.BlueString(containerDetails.ServiceName), color.WhiteString(containerDetails.Image))
}

func PrintContainerUpdateDetails(containerDetails *ContainerDetails) {
	var status string
	switch containerDetails.IsUpToDate {
	case false:
		status = color.YellowString("Update found")
	default:
		status = "Up to date"
	}

	fmt.Printf("%s: %s\n", GetContainerInfoString(containerDetails), status)
}

func PullNewImage(dockerClient *client.Client, containerDetails *ContainerDetails) error {
	pullResponse, err := dockerClient.ImagePull(context.Background(), containerDetails.Image, image.PullOptions{})
	if err != nil {
		return err
	}
	defer pullResponse.Close()

	return nil
}

func StartContainers(composeFilePath string) error {
	cmd := exec.Command("docker", "compose", "-f", composeFilePath, "up", "-d")
	err := cmd.Run()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			return fmt.Errorf(string(exitErr.Stderr))
		}
		return err
	}

	return nil
}

func getLocalImageDigest(dockerClient *client.Client, containerDetails *ContainerDetails) (string, error) {
	imageDetails, _, err := dockerClient.ImageInspectWithRaw(context.Background(), containerDetails.ImageID)
	if err != nil {
		return "", err
	}

	if len(imageDetails.RepoDigests) == 0 {
		return "", fmt.Errorf("No local image digest found for %s(%s)", GetContainerInfoString(containerDetails), containerDetails.ImageID)
	}

	imageDigest := strings.TrimSpace(imageDetails.RepoDigests[0])
	if imageDigest == "" {
		return "", fmt.Errorf("Local image digest is empty for %s(%s)", GetContainerInfoString(containerDetails), containerDetails.ImageID)
	}

	return imageDigest, nil
}

func getRemoteImageDigest(rc *regclient.RegClient, containerDetails *ContainerDetails) (string, error) {
	imageRef, err := ref.New(containerDetails.Image)
	if err != nil {
		return "", err
	}
	defer rc.Close(context.Background(), imageRef)

	manifest, err := rc.ManifestHead(context.Background(), imageRef)
	if err != nil {
		return "", err
	}

	remoteDigest := manifest.GetDescriptor().Digest.String()
	remoteDigest = strings.TrimSpace(remoteDigest)
	if remoteDigest == "" {
		return "", fmt.Errorf("Remote image digest is empty for %s", GetContainerInfoString(containerDetails))
	}

	return remoteDigest, nil
}
