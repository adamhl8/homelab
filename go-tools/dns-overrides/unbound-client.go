package main

import (
	"fmt"

	"github.com/imroc/req/v3"
)

type Client struct {
	reqClient *req.Client
}

func NewClient(baseURL, opnsenseKey, opnsenseSecret string) *Client {
	reqClient := req.C().
		EnableInsecureSkipVerify().
		SetBaseURL(baseURL).
		SetCommonBasicAuth(opnsenseKey, opnsenseSecret).
		EnableDumpEachRequest()

	return &Client{
		reqClient: reqClient,
	}
}

type Override struct {
	Domain string `json:"domain"`
	UUID   string `json:"uuid"`
}

func (c *Client) GetOverrides() ([]Override, error) {
	const listPath = "/settings/searchHostOverride"

	listResponse, err := c.reqClient.R().Get(listPath)
	if err != nil {
		zlog.Debug().Str("dump", listResponse.Dump()).Msg("listResponse")

		return nil, fmt.Errorf("failed to get current overrides: %w", err)
	}

	var listData struct {
		Rows []Override
	}

	if err := listResponse.UnmarshalJson(&listData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal list response: %w", err)
	}

	zlog.Debug().Interface("listData", listData).Msg("Got overrides")

	return listData.Rows, nil
}

func (c *Client) DeleteOverride(override Override) error {
	const deletePath = "/settings/delHostOverride"

	zlog.Debug().Str("domain", override.Domain).Str("uuid", override.UUID).Msg("Deleting override")

	deleteResponse, err := c.reqClient.R().SetBodyString("").Post(deletePath + "/" + override.UUID)
	if err != nil {
		return fmt.Errorf("failed to delete override: %w", err)
	}

	zlog.Debug().Str("dump", deleteResponse.Dump()).Msg("deleteResponse")

	return nil
}

type NewOverride struct {
	Enabled     string `json:"enabled"`
	Hostname    string `json:"hostname"`
	Domain      string `json:"domain"`
	RR          string `json:"rr"`
	MXPrio      string `json:"mxprio"`
	MX          string `json:"mx"`
	Server      string `json:"server"`
	Description string `json:"description"`
}

func (c *Client) AddOverride(override *NewOverride) error {
	const addPath = "/settings/addHostOverride"

	var overrideData struct {
		Host *NewOverride `json:"host"`
	}

	overrideData.Host = override

	zlog.Debug().Interface("overrideData", overrideData).Msg("Adding override")

	addResponse, err := c.reqClient.R().SetBodyJsonMarshal(overrideData).Post(addPath)
	if err != nil {
		return fmt.Errorf("failed to add override: %w", err)
	}

	zlog.Debug().Str("dump", addResponse.Dump()).Msg("addResponse")

	return nil
}

func (c *Client) RestartUnbound() error {
	const restartPath = "/service/restart"

	restartResponse, err := c.reqClient.R().SetBodyString("").Post(restartPath)
	if err != nil {
		return fmt.Errorf("failed to restart unbound: %w", err)
	}

	zlog.Debug().Str("dump", restartResponse.Dump()).Msg("restartResponse")

	return nil
}
