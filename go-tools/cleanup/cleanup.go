package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"github.com/sourcegraph/conc"
)

func cleanup() {

	if os.Geteuid() != 0 {
		fmt.Println("Please run the program with sudo.")
		os.Exit(1)
	}

	// List of paths to remove
	pathsToRemove := []string{
		".android",
		".cache",
		".cups",
		".dbclient",
		".embedded-postgres-go",
		".gradle",
		".hawtjni",
		".lesshst",
		".matplotlib",
		".m2",
		".node_repl_history",
		".npm",
		".pnpm-state",
		".python_history",
		".sonarlint",
		".sts4",
		".yarn",
		".yarnrc",
		"Movies",
		"Music",
		".bash_history",
		".viminfo",
		".zsh_history",
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("Error getting home directory:", err)
		return
	}

	// Remove the specified paths
	for _, path := range pathsToRemove {
		fullPath := filepath.Join(homeDir, path)
		if _, err := os.Stat(fullPath); err == nil {
			err := os.RemoveAll(fullPath)
			if err != nil {
				fmt.Printf("Error removing %s: %v\n", fullPath, err)
			} else {
				fmt.Printf("Removed %s\n", fullPath)
			}
		}
	}

	// Patterns to search for
	patterns := map[string]*regexp.Regexp{
		".DS_Store files":  regexp.MustCompile(`^\.DS_Store$`),
		".localized files": regexp.MustCompile(`^\.localized$`),
		"._ files":         regexp.MustCompile(`^\._`),
	}

	var wg conc.WaitGroup
	var mutex sync.Mutex
	foundFiles := make(map[string][]string)

	for description, regex := range patterns {
		wg.Go(func() {
			fmt.Printf("Finding %s...\n", description)

			var matches []string
			err := filepath.WalkDir(homeDir, func(path string, d os.DirEntry, err error) error {
				if err != nil {
					return err
				}
				if !d.IsDir() {
					if regex.MatchString(d.Name()) {
						matches = append(matches, path)
					}
				}
				return nil
			})
			if err != nil {
				fmt.Printf("Error walking the path for %s: %v\n", description, err)
				return
			}

			mutex.Lock()
			foundFiles[description] = matches
			mutex.Unlock()
		})
	}

	wg.Wait()

	reader := bufio.NewReader(os.Stdin)
	// Prompt the user for each type of file
	for desc, files := range foundFiles {
		if len(files) > 0 {
			fmt.Printf("\nFound %s:\n", desc)
			for _, file := range files {
				fmt.Println(file)
			}
			fmt.Print("Delete? [Y/n] ")
			reply, _ := reader.ReadString('\n')
			reply = strings.TrimSpace(reply)
			if reply == "" || strings.ToLower(reply) == "y" {
				// Delete the files
				for _, file := range files {
					err := os.Remove(file)
					if err != nil {
						fmt.Printf("Error deleting %s: %v\n", file, err)
					} else {
						fmt.Printf("Deleted %s\n", file)
					}
				}
			}
		}
	}
}
