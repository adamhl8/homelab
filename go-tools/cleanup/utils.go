package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"github.com/charlievieth/fastwalk"
	"github.com/rs/zerolog"
)

type FileDetails struct {
	Name    string
	Paths   []string
	Pattern *regexp.Regexp
	mutex   sync.Mutex
}

func (f *FileDetails) addPath(path string) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	f.Paths = append(f.Paths, path)
}

type FileDetailsList []*FileDetails

func findFiles(log *zerolog.Logger, dirs []string, patterns map[string]*regexp.Regexp) FileDetailsList {
	fileDetailsList := FileDetailsList{}
	for name := range patterns {
		fileDetailsList = append(fileDetailsList, &FileDetails{
			Name:    name,
			Paths:   []string{},
			Pattern: patterns[name],
		})
	}

	walkFn := func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return fmt.Errorf("error walking the path '%s': %w", path, err)
		}

		if entry.IsDir() {
			return nil
		}

		for _, fileDetails := range fileDetailsList {
			if fileDetails.Pattern.MatchString(entry.Name()) {
				fileDetails.addPath(path)
			}
		}

		return nil
	}
	walkFn = fastwalk.IgnorePermissionErrors(walkFn)

	for _, dir := range dirs {
		dir = filepath.Clean(dir)

		log.Info().Str("dir", dir).Msg("Finding files...")

		err := fastwalk.Walk(nil, dir, walkFn)
		if err != nil {
			log.Error().Err(err).Str("dir", dir).Msg("Error finding files")
		}
	}

	return fileDetailsList
}

func shouldRemoveFiles(log *zerolog.Logger, fileDetails *FileDetails) bool {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println()

	if len(fileDetails.Paths) == 0 {
		log.Info().Str("name", fileDetails.Name).Msg("No files found")

		return false
	}

	log.Info().Str("name", fileDetails.Name).Msg("Found files")

	for _, file := range fileDetails.Paths {
		log.Info().Str("file", file).Msg("")
	}

	fmt.Print("Delete? [Y/n] ")

	reply, _ := reader.ReadString('\n')

	reply = strings.TrimSpace(reply)
	if reply == "y" || reply == "" {
		return true
	}

	return false
}

func removePath(log *zerolog.Logger, path string, ignoreIfNotExists bool) {
	if _, err := os.Stat(path); err != nil {
		if ignoreIfNotExists {
			return
		}

		log.Error().Err(err).Str("path", path).Msg("Error checking path")

		return
	}

	err := os.RemoveAll(path)
	if err != nil {
		log.Error().Err(err).Str("path", path).Msg("Error removing path")

		return
	}

	log.Info().Str("path", path).Msg("Removed path")
}

func cleanPath(path string) string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to get home directory: %v\n", err)
		os.Exit(1)
	}

	if path == "~" || path == "~/" {
		path = homeDir
	} else if strings.HasPrefix(path, "~/") {
		path = filepath.Join(homeDir, path[2:])
	}

	return filepath.Clean(path)
}
