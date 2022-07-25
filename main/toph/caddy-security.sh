#!/bin/bash

source ~/secrets
tee ~/caddy/users.json << EOF
{
  "version": "1.0.35",
  "policy": {
    "password": {
      "keep_versions": 10,
      "min_length": 8,
      "max_length": 128,
      "require_uppercase": false,
      "require_lowercase": false,
      "require_number": false,
      "require_non_alpha_numeric": false,
      "block_reuse": false,
      "block_password_change": false
    },
    "user": {
      "min_length": 3,
      "max_length": 50,
      "allow_non_alpha_numeric": false,
      "allow_uppercase": false
    }
  },
  "revision": 7,
  "last_modified": "2022-07-24T22:51:26.415088254Z",
  "users": [
    {
      "id": "bfd2aa96-fcd3-4536-be39-a1197d0cd616",
      "username": "adam",
      "email_address": {
        "address": "adamhl@pm.me",
        "domain": "pm.me"
      },
      "email_addresses": [
        {
          "address": "adamhl@pm.me",
          "domain": "pm.me"
        }
      ],
      "passwords": [
        {
          "purpose": "generic",
          "algorithm": "bcrypt",
          "hash": "\$2a\$10\$VDEPmf84mFZsfh4GF1tIuOFlmu8bWhMlhCYNmZbdhDYDNLID/1PtS",
          "cost": 10,
          "expired_at": "0001-01-01T00:00:00Z",
          "created_at": "2022-07-24T22:45:49.499593781Z",
          "disabled_at": "0001-01-01T00:00:00Z"
        }
      ],
      "mfa_tokens": [
        {
          "id": "1yOtDU5MYxWzUefDXVJekH75xjV6WjMK9ASOsM6Z",
          "type": "totp",
          "algorithm": "sha1",
          "comment": "auth.adamhl.dev",
          "secret": "${caddy_security_2fa_secret}",
          "period": 30,
          "digits": 6,
          "expired_at": "0001-01-01T00:00:00Z",
          "created_at": "2022-07-24T22:51:26.415081058Z",
          "disabled_at": "0001-01-01T00:00:00Z"
        }
      ],
      "created": "2022-07-24T22:45:49.499593291Z",
      "last_modified": "2022-07-24T22:51:26.41508812Z",
      "revision": 5,
      "roles": [
        {
          "name": "admin",
          "organization": "authp"
        }
      ]
    }
  ]
}
EOF