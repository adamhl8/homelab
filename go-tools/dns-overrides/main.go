package main

import (
	"flag"
	"os"

	"adamhl8/dns-overrides/sops"

	"github.com/rs/zerolog"
)

const (
	caddyfilePath   = "/Users/adam/homelab/wip/caddy/Caddyfile"
	secretsFilePath = "/Users/adam/homelab/configs/secrets.yaml"
	caddyDomain     = "caddy.lan"
	baseURL         = "https://opnsense.lan/api/unbound"
)

var zlog zerolog.Logger

func init() {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	zlog = zerolog.New(os.Stderr).With().Timestamp().Logger()
	zlog = zlog.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	verboseFlag := flag.Bool("v", false, "Verbose output")
	flag.Parse()

	verbose := *verboseFlag
	if verbose {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}
}

func main() {
	zlog.Info().Msg("Getting secrets...")

	sops, err := sops.NewSops(secretsFilePath, "yaml")
	if err != nil {
		zlog.Fatal().Err(err).Msg("Failed to create Sops")
	}

	opnsenseKey, err := sops.GetSecret("opnsense_key")
	if err != nil {
		zlog.Fatal().Err(err).Msg("Failed to get opnsense key")
	}

	opnsenseSecret, err := sops.GetSecret("opnsense_secret")
	if err != nil {
		zlog.Fatal().Err(err).Msg("Failed to get opnsense secret")
	}

	zlog.Info().Msg("Getting domains from Caddyfile...")

	domains, err := getDomainsFromCaddyfile(caddyfilePath)
	if err != nil {
		zlog.Fatal().Err(err).Msg("Failed to get domains from Caddyfile")
	}

	zlog.Debug().Msgf("Getting IP address for: %s", caddyDomain)

	caddyIP, err := lookupIP(caddyDomain)
	if err != nil {
		zlog.Fatal().Err(err).Msgf("Failed to get IP address for: %s", caddyDomain)
	}

	zlog.Debug().Msgf("IP address for '%s' is: %s", caddyDomain, caddyIP)

	overrides := make([]*NewOverride, 0, len(domains))

	for _, domain := range domains {
		newOverride := &NewOverride{
			Enabled:  "1",
			Hostname: "*",
			Domain:   domain,
			RR:       "A",
			Server:   caddyIP,
		}
		overrides = append(overrides, newOverride)
	}

	unbound := NewClient(baseURL, opnsenseKey, opnsenseSecret)

	updateUnboundOverrides(unbound, overrides)
}

func updateUnboundOverrides(unbound *Client, newOverrides []*NewOverride) {
	zlog.Info().Msg("Getting current overrides...")

	overrides, err := unbound.GetOverrides()
	if err != nil {
		zlog.Fatal().Err(err).Msg("Failed to get current overrides")
	}

	zlog.Info().Msg("Deleting current overrides...")

	for _, override := range overrides {
		if err := unbound.DeleteOverride(override); err != nil {
			zlog.Error().Err(err).Str("domain", override.Domain).Str("uuid", override.UUID).Msg("Failed to delete override")
		}
	}

	for _, override := range newOverrides {
		if err := unbound.AddOverride(override); err != nil {
			zlog.Error().Err(err).Str("domain", override.Domain).Msg("Failed to add override")
		}
	}

	zlog.Info().Msg("Restarting unbound...")

	if err := unbound.RestartUnbound(); err != nil {
		zlog.Error().Err(err).Msg("Failed to restart unbound")
	}
}
