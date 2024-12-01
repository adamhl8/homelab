package main

import (
	"bytes"
	"errors"
	"flag"
	"os"
	"path/filepath"
	"strings"

	"github.com/bmatcuk/doublestar/v4"
	"github.com/rs/zerolog"
	"github.com/tidwall/gjson"
	ff "github.com/u2takey/ffmpeg-go"
)

func main() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	plog := zerolog.New(os.Stderr).With().Timestamp().Logger()
	plog = plog.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	verboseFlag := flag.Bool("v", false, "Verbose output")
	inputFlag := flag.String("i", "", "Input path")
	outputFlag := flag.String("o", "", "Output path")

	flag.Parse()
	flag.VisitAll(func(f *flag.Flag) {
		if f.DefValue == "" && f.Value.String() == "" {
			plog.Error().Msgf("Missing flag -%s", f.Name)
			flag.Usage()
			os.Exit(1)
		}
	})

	verbose := *verboseFlag
	if verbose {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	inputPath := filepath.Clean(*inputFlag)
	outputPath := filepath.Clean(*outputFlag)
	globPattern := inputPath + "/**"

	filePaths, err := doublestar.FilepathGlob(globPattern, doublestar.WithFilesOnly())
	if err != nil {
		plog.Fatal().Err(err).Msg("Error globbing input path")
	}

	for _, filePath := range filePaths {
		relativeFilePath, err := filepath.Rel(inputPath, filePath)
		if err != nil {
			plog.Error().Err(err).Str("file", filePath).Msg("Error getting relative file path")
		}

		fileLogger := plog.With().Str("file", relativeFilePath).Logger()

		videoInfo, err := ff.Probe(filePath)
		if err != nil {
			fileLogger.Error().Msg("Error probing file")
			fileLogger.Debug().Err(err).Msg("")

			continue
		}

		codecName := gjson.Get(videoInfo, "streams.0.codec_name").String()
		codecName = strings.TrimSpace(codecName)
		codecName = strings.ToLower(codecName)

		if codecName == "hevc" {
			fileLogger.Warn().Msg("Video is already x265, skipping")

			continue
		}

		if codecName == "" {
			fileLogger.Error().Msg("No codec name found")

			continue
		}

		filePathAsMp4 := strings.TrimSuffix(relativeFilePath, filepath.Ext(relativeFilePath)) + ".mp4"
		outputFilePath := filepath.Join(outputPath, filePathAsMp4)
		outputFileDir := filepath.Dir(outputFilePath)
		dirPerm := 0o755

		err = os.MkdirAll(outputFileDir, os.FileMode(dirPerm))
		if err != nil {
			fileLogger.Error().Err(err).Msg("Error creating output directory")

			continue
		}

		ffmpegArgs := ff.KwArgs{
			"c:v":          "libx265",
			"preset":       "faster",
			"crf":          "26",
			"c:a":          "aac",
			"b:a":          "128k",
			"movflags":     "+faststart",
			"sn":           "",
			"map_metadata": "-1",
			"map_chapters": "-1",
		}

		fileLogger.Info().Str("output", outputFilePath).Msg("Converting video...")

		var output bytes.Buffer

		err = ff.Input(filePath).
			Output(outputFilePath, ffmpegArgs).
			OverWriteOutput().
			Silent(true).
			WithErrorOutput(&output).
			WithOutput(&output).
			Run()
		if err != nil {
			fileLogger.Error().Err(err).Msg("Error converting video")
			fileLogger.Debug().Err(errors.New(output.String())).Msg("")

			continue
		}

		fileLogger.Info().Msg("Successfully converted video")
	}
}
