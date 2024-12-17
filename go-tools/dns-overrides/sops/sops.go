package sops

import (
	"errors"
	"fmt"

	"github.com/getsops/sops/v3/decrypt"
	"github.com/goccy/go-yaml"
)

var ErrUnsupportedFormat = errors.New("unsupported format")

type File struct {
	secrets map[string]interface{}
	format  string
}

func NewSops(path string, format string) (*File, error) {
	if format != "yaml" {
		return nil, fmt.Errorf("%w: %s", ErrUnsupportedFormat, format)
	}

	data, err := decrypt.File(path, format)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt file: %w", err)
	}

	var secrets map[string]interface{}

	if err := yaml.Unmarshal(data, &secrets); err != nil {
		return nil, fmt.Errorf("failed to unmarshal file: %w", err)
	}

	return &File{
		secrets: secrets,
		format:  format,
	}, nil
}

var ErrKeyNotFound = errors.New("key not found")

func (s *File) GetSecret(key string) (string, error) {
	if value, ok := s.secrets[key]; ok {
		return fmt.Sprint(value), nil
	}

	return "", fmt.Errorf("%w: %s", ErrKeyNotFound, key)
}
