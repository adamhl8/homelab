package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/render"
	"github.com/imroc/req/v3"
)

type QuartzRequest struct {
	ArtifactUrl string `json:"artifactUrl"`
}

func (q *QuartzRequest) Bind(r *http.Request) error {
	if q.ArtifactUrl == "" {
		return fmt.Errorf("artifactUrl is required")
	}

	return nil
}

func main() {
	githubToken, ok := os.LookupEnv("GITHUB_TOKEN")
	if !ok {
		slog.Error("GITHUB_TOKEN is not set")
		os.Exit(1)
	}

	r := chi.NewRouter()
	reqClient := req.C()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	const timeout = 10 * time.Second

	r.Use(middleware.Timeout(timeout))

	r.Post("/quartz", func(w http.ResponseWriter, r *http.Request) {
		data := &QuartzRequest{}
		if err := render.Bind(r, data); err != nil {
			slog.Error("invalid request", "error", err)
			w.WriteHeader(http.StatusBadRequest)

			return
		}

		slog.Info("getting artifact", "artifact_url", data.ArtifactUrl)

		err := getGithubArtifact(reqClient, githubToken, data.ArtifactUrl, "adamhl-dev.zip")
		if err != nil {
			slog.Error("failed to get artifact", "error", err)
			w.WriteHeader(http.StatusInternalServerError)

			return
		}

		w.WriteHeader(http.StatusOK)
	})

	const LISTEN_ADDRESS = ":3333"

	slog.Info("listening on " + LISTEN_ADDRESS)
	http.ListenAndServe(LISTEN_ADDRESS, r)
}

func getGithubArtifact(reqClient *req.Client, githubToken string, artifactUrl string, outPath string) error {
	resp, err := reqClient.R().
		SetBearerAuthToken(githubToken).
		SetHeader("Accept", "application/vnd.github+json").
		SetHeader("X-GitHub-Api-Version", "2022-11-28").
		SetOutputFile(outPath).
		Get(artifactUrl)
	if err != nil {
		return fmt.Errorf("failed to make GET request: %w", err)
	}

	if resp.IsErrorState() {
		return fmt.Errorf("got error response: %s", resp.Status)
	}

	return nil
}
