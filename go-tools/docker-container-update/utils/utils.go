package utils

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/fatih/color"
	"github.com/regclient/regclient"
	"github.com/regclient/regclient/types/ref"
)

type ComposeStack struct {
	Path       string
	Containers []*ContainerDetails
}

type ContainerDetails struct {
	ImageID         string
	Image           string
	ServiceName     string
	ComposeFilePath string
	IsUpToDate      bool
	InfoString      string
}

type ComposeStacks map[string]*ComposeStack

func GetComposeStacks(ctx context.Context, dockerClient *client.Client) (ComposeStacks, error) {
	containers, err := dockerClient.ContainerList(ctx, container.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to get container list from docker: %w", err)
	}

	composeStacks := make(ComposeStacks)

	for _, container := range containers {
		serviceName := container.Labels["com.docker.compose.service"]
		composeFilePath := container.Labels["com.docker.compose.project.config_files"]
		infoString := fmt.Sprintf("%s[%s]", color.BlueString(serviceName), color.WhiteString(container.Image))

		containerDetails := &ContainerDetails{
			ImageID:         container.ImageID,
			Image:           container.Image,
			ServiceName:     serviceName,
			ComposeFilePath: composeFilePath,
			IsUpToDate:      true,
			InfoString:      infoString,
		}

		if _, ok := composeStacks[containerDetails.ComposeFilePath]; !ok {
			composeStacks[containerDetails.ComposeFilePath] = &ComposeStack{
				Path:       containerDetails.ComposeFilePath,
				Containers: []*ContainerDetails{},
			}
		}

		composeStack := composeStacks[containerDetails.ComposeFilePath]
		composeStack.Containers = append(composeStack.Containers, containerDetails)
	}

	return composeStacks, nil
}

func CheckForContainerUpdate(
	ctx context.Context,
	dockerClient *client.Client,
	regclient *regclient.RegClient,
	containerDetails *ContainerDetails,
) error {
	localImageDigest, err := getLocalImageDigest(ctx, dockerClient, containerDetails)
	if err != nil {
		return fmt.Errorf("failed to get local image digest for %s: %w", containerDetails.InfoString, err)
	}

	remoteImageDigest, err := getRemoteImageDigest(ctx, regclient, containerDetails)
	if err != nil {
		return fmt.Errorf("failed to get remote image digest for %s: %w", containerDetails.InfoString, err)
	}

	containerDetails.IsUpToDate = strings.Contains(localImageDigest, remoteImageDigest)

	return nil
}

func PrintContainerUpdateDetails(containerDetails *ContainerDetails) {
	var status string

	switch containerDetails.IsUpToDate {
	case false:
		status = color.YellowString("Update found")
	default:
		status = "Up to date"
	}

	fmt.Printf("%s: %s\n", containerDetails.InfoString, status)
}

func PullNewImage(ctx context.Context, dockerClient *client.Client, containerDetails *ContainerDetails) error {
	reader, err := dockerClient.ImagePull(ctx, containerDetails.Image, image.PullOptions{})
	if err != nil {
		return fmt.Errorf("failed to initiate image pull for %s: %w", containerDetails.InfoString, err)
	}
	defer reader.Close()

	_, err = io.Copy(io.Discard, reader)
	if err != nil {
		return fmt.Errorf("failed to pull image for %s: %w", containerDetails.InfoString, err)
	}

	return nil
}

var errDockerComposeCmd = errors.New("failed to run docker compose command")

func StartContainers(composeFilePath string) error {
	cmd := exec.Command("docker", "compose", "-f", composeFilePath, "up", "-d")

	err := cmd.Run()
	if err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return fmt.Errorf("%w: %s", errDockerComposeCmd, string(exitErr.Stderr))
		}

		return fmt.Errorf("%w: %w", errDockerComposeCmd, err)
	}

	return nil
}

var (
	errNoLocalImageDigest    = errors.New("no local image digest found")
	errLocalImageDigestEmpty = errors.New("local image digest is empty")
)

func getLocalImageDigest(
	ctx context.Context,
	dockerClient *client.Client,
	containerDetails *ContainerDetails,
) (string, error) {
	imageDetails, _, err := dockerClient.ImageInspectWithRaw(ctx, containerDetails.ImageID)
	if err != nil {
		return "", fmt.Errorf("failed to inspect image for %s: %w", containerDetails.InfoString, err)
	}

	if len(imageDetails.RepoDigests) == 0 {
		return "", fmt.Errorf("%w for %s(%s)", errNoLocalImageDigest, containerDetails.InfoString, containerDetails.ImageID)
	}

	imageDigest := strings.TrimSpace(imageDetails.RepoDigests[0])
	if imageDigest == "" {
		return "", fmt.Errorf("%w for %s(%s)",
			errLocalImageDigestEmpty, containerDetails.InfoString, containerDetails.ImageID)
	}

	return imageDigest, nil
}

var errRemoteImageDigestEmpty = errors.New("remote image digest is empty")

func getRemoteImageDigest(
	ctx context.Context,
	regclient *regclient.RegClient,
	containerDetails *ContainerDetails,
) (string, error) {
	imageRef, err := ref.New(containerDetails.Image)
	if err != nil {
		return "", fmt.Errorf("failed to create image reference for %s(%s): %w",
			containerDetails.InfoString, containerDetails.ImageID, err)
	}
	defer regclient.Close(ctx, imageRef)

	manifest, err := regclient.ManifestHead(ctx, imageRef)
	if err != nil {
		return "", fmt.Errorf("failed to get manifest head for %s(%s): %w",
			containerDetails.InfoString, containerDetails.ImageID, err)
	}

	remoteDigest := manifest.GetDescriptor().Digest.String()
	remoteDigest = strings.TrimSpace(remoteDigest)

	if remoteDigest == "" {
		return "", fmt.Errorf(
			"%w for %s(%s)",
			errRemoteImageDigestEmpty,
			containerDetails.InfoString,
			containerDetails.ImageID,
		)
	}

	return remoteDigest, nil
}
