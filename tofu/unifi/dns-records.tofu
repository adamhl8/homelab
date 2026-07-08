terraform {
  backend "s3" {
    profile = "adamhl8"
    bucket  = "tofu-state-269329412317-us-east-1-an"
    key     = "unifi.tfstate"
    region  = "us-east-1"
  }
}

terraform {
  required_providers {
    unifi = {
      source  = "ubiquiti-community/unifi"
      version = "~> 0.54"
    }
    dns = {
      source  = "hashicorp/dns"
      version = "~> 3.6"
    }
    sops = {
      source  = "carlpett/sops"
      version = "~> 1.4"
    }
  }
}

data "sops_file" "secrets" {
  source_file = "${path.module}/../../configs/secrets.yaml"
}

provider "unifi" {
  api_url        = "https://ucg-fiber.lan"
  api_key        = data.sops_file.secrets.data["unifi_dns-overrides_api_key"]
  allow_insecure = true
}

locals {
  caddyfile = file("${path.module}/../../incus/caddy/Caddyfile")

  # site blocks like "foo.adamhl.dev {" -> skips *.adamhl.dev and the apex domain
  caddy_domains = toset([
    for m in regexall("(?m)^([A-Za-z0-9.-]+\\.adamhl\\.dev)\\s+\\{", local.caddyfile) : m[0]
  ])

  excluded_domains = ["auth.adamhl.dev"]
  domains          = setsubtract(local.caddy_domains, local.excluded_domains)
}

data "dns_a_record_set" "caddy" {
  host = "caddy.lan"
}

resource "unifi_dns_record" "caddy_override" {
  for_each = local.domains

  name        = each.value
  record_type = "A"
  value       = data.dns_a_record_set.caddy.addrs[0]
  enabled     = true
  ttl         = "1s"
}
