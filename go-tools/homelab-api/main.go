package main

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	const timeout = 10 * time.Second

	r.Use(middleware.Timeout(timeout))

	r.Post("/quartz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	const LISTEN_ADDRESS = ":3333"

	slog.Info("listening on " + LISTEN_ADDRESS)
	http.ListenAndServe(LISTEN_ADDRESS, r)
}
