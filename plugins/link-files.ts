import fs from "node:fs/promises"
import path from "node:path"
import { $ } from "bun"
import type { StatefulPluginFactory } from "bun-infra/types/plugin"
import { normalizePath, resolveLocalPath } from "../utils/paths.ts"

interface Link {
  source: string
  dest: string
}

interface LinkFilesChange {
  added: Link[]
  removed: Link[]
}

const linkFiles: StatefulPluginFactory<Link[], LinkFilesChange> = (links) => ({
  name: "Link Files",
  desired: async () => {
    const expandedLinks: Link[] = []
    for (const link of links) {
      const glob = new Bun.Glob(link.source)
      const files = await Array.fromAsync(glob.scan({ dot: true }))
      for (const file of files) {
        const source = resolveLocalPath(file)
        let dest = normalizePath(link.dest)
        dest = dest.endsWith(path.basename(source)) ? dest : path.join(dest, path.basename(source))
        expandedLinks.push({ source, dest })
      }
    }
    return expandedLinks
  },
  current: async (_, links) => {
    const validLinks: Link[] = []
    for (const link of links) {
      try {
        const target = await fs.readlink(link.dest)
        if (target === link.source) validLinks.push(link)
      } catch {
        // ignore if file doesn't exist or isn't a symlink
      }
    }
    return validLinks
  },
  change: (_, previous, current, links) => {
    const toKey = (link: Link) => `${link.source}:${link.dest}`

    const currentSet = new Set(current.map(toKey))
    const desiredSet = new Set(links.map(toKey))

    // in desired but not in current
    const added = links.filter((link) => !currentSet.has(toKey(link)))

    // in previous but not in desired
    const removed = (previous ?? []).filter((link) => !desiredSet.has(toKey(link)))

    if (added.length === 0 && removed.length === 0) return
    return { added, removed }
  },
  handle: async (_, change) => {
    if (change.removed.length > 0) {
      for (const link of change.removed) {
        console.info(`Removing link ${link.dest}`)
        await $`rm -f ${link.dest}`
      }
    }
    if (change.added.length > 0) {
      for (const link of change.added) {
        console.info(`Linking ${link.source} to ${link.dest}`)
        await $`mkdir -p ${path.dirname(link.dest)}`
        await $`ln -f -s ${link.source} ${link.dest}`
      }
    }
  },
})

export { linkFiles }
