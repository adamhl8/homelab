import { $ } from "bun"
import { createPlugin } from "bun-infra/plugin"

interface HostnameDiff {
  hostname?: { old: string; new: string }
  localHostname?: { old: string; new: string }
}

// https://dl.dod.cyber.mil/wp-content/uploads/pki-pke/zip/unclass-certificates_pkcs7_DoD.zip
// openssl pkcs7 -inform DER -outform PEM -in ~/Downloads/certificates_pkcs7_v5_13_dod/certificates_pkcs7_v5_13_dod_DoD_Root_CA_3_der.p7b -print_certs | awk '/subject=/ { filename = "dod_root_ca_3_" ++count ".cer" } { if (NF > 0) print > filename }'
// need -d or else trust settings are not applied
// need to -r trustAsRoot to always trust
// sudo security add-trusted-cert -d -r trustAsRoot -k ~/Library/Keychains/login.keychain-db dod_root_ca_3_1.cer
// for cert in *.cer; if head -n 1 $cert | string match -q "*DoD Root*"; sudo security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db $cert; else; sudo security add-trusted-cert -d -r trustAsRoot -k ~/Library/Keychains/login.keychain-db $cert; end; end

//sudo defaults write /Library/Preferences/com.apple.security.smartcard allowSmartCard -bool false

// osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"${1}\" as POSIX file"

// bun install -g npm-check-updates
// bun install -g yarn

// go install mvdan.cc/gofumpt@latest

const hostname = createPlugin<string, HostnameDiff>(
  { name: "hostname" },
  {
    diff: async (ctx, _previous, hostname) => {
      if (ctx.os === "darwin") {
        const { sudo } = ctx
        const currentHostname = (await $`${sudo} scutil --get HostName`.quiet().nothrow()).text().trim()
        const currentLocalHostname = (await $`${sudo} scutil --get LocalHostName`.quiet().nothrow()).text().trim()
        const diff: HostnameDiff = {}
        if (currentHostname !== hostname) diff.hostname = { old: currentHostname, new: hostname }
        if (currentLocalHostname !== hostname) diff.localHostname = { old: currentLocalHostname, new: hostname }
        if (Object.keys(diff).length === 0) return
        return diff
      }
      return
    },
    handle: async (ctx, diff) => {
      if (ctx.os === "darwin") {
        const { sudo } = ctx
        if (diff.hostname) await $`${sudo} scutil --set HostName ${diff.hostname.new}`
        if (diff.localHostname) await $`${sudo} scutil --set LocalHostName ${diff.localHostname.new}`
      }
    },
  },
)

export { hostname }
