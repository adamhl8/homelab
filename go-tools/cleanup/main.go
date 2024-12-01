package main

import (
	"fmt"
	"os"
	"regexp"

	"github.com/rs/zerolog"
	"github.com/samber/lo"
)

type CleanupDetails struct {
	PathsToRemove  []string
	SearchDirs     []string
	SearchPatterns map[string]*regexp.Regexp
}

func getCleanupDetails() CleanupDetails {
	pathsToRemove := []string{
		"~/.android",
		"~/.bash_history",
		"~/.cache",
		"~/.cocoapods",
		"~/.cups",
		"~/.dbclient",
		"~/.embedded-postgres-go",
		"~/.expo",
		"~/.gradle",
		"~/.hawtjni",
		"~/.lemminx",
		"~/.lesshst",
		"~/.matplotlib",
		"~/.m2",
		"~/.node_repl_history",
		"~/.npm",
		"~/.pnpm-state",
		"~/.python_history",
		"~/.sonarlint",
		"~/.sts4",
		"~/.swiftpm",
		"~/.yarn",
		"~/.yarnrc",
		"~/Movies",
		"~/Music",
		"~/.viminfo",
		"~/.zsh_history",
	}

	searchDirs := []string{
		"~",
		"/Volumes",
		"/Applications",
	}

	searchPatterns := map[string]*regexp.Regexp{
		"dsstore":       regexp.MustCompile(`^\.DS_Store$`),
		"localized":     regexp.MustCompile(`^\.localized$`),
		"dotunderscore": regexp.MustCompile(`^\._`),
	}

	pathsToRemove = lo.Map(pathsToRemove, func(path string, _ int) string {
		return cleanPath(path)
	})
	searchDirs = lo.Map(searchDirs, func(path string, _ int) string {
		return cleanPath(path)
	})

	return CleanupDetails{
		PathsToRemove:  pathsToRemove,
		SearchDirs:     searchDirs,
		SearchPatterns: searchPatterns,
	}
}

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	plog := zerolog.New(os.Stderr).With().Timestamp().Logger()
	plog = plog.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	if os.Geteuid() != 0 {
		plog.Fatal().Msg("Please run the program as root.")
	}

	cleanupDetails := getCleanupDetails()
	for _, path := range cleanupDetails.PathsToRemove {
		removePath(&plog, path, true)
	}

	plog.Info().Msg("Removed paths")
	fmt.Println()

	fileDetailsList := findFiles(&plog, cleanupDetails.SearchDirs, cleanupDetails.SearchPatterns)
	for _, fileDetails := range fileDetailsList {
		shouldRemove := shouldRemoveFiles(&plog, fileDetails)
		if !shouldRemove {
			continue
		}

		for _, path := range fileDetails.Paths {
			removePath(&plog, path, false)
		}
	}

	fmt.Println()
	plog.Info().Msg("Done")
}
