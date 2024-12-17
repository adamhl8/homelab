package main

import (
	"errors"
	"fmt"
	"net"
	"os"
	"regexp"
)

func getDomainsFromCaddyfile(caddyfilePath string) ([]string, error) {
	caddyfileContent, err := os.ReadFile(caddyfilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read Caddyfile: %w", err)
	}

	re := regexp.MustCompile(`@\w+ host (?P<domain>[\w\.]+)`)
	matches := re.FindAllStringSubmatch(string(caddyfileContent), -1)

	domainIndex := re.SubexpIndex("domain")

	domains := make([]string, 0, len(matches))

	for _, match := range matches {
		domain := match[domainIndex]
		domains = append(domains, domain)
	}

	return domains, nil
}

var ErrNoIPv4Found = errors.New("no IPv4 address found for domain")

func lookupIP(domain string) (string, error) {
	ips, err := net.LookupIP(domain)
	if err != nil {
		return "", fmt.Errorf("could not look up IP for %s: %w", domain, err)
	}

	for _, ip := range ips {
		if ipv4 := ip.To4(); ipv4 != nil {
			return ipv4.String(), nil
		}
	}

	return "", fmt.Errorf("%w: %s", ErrNoIPv4Found, domain)
}
