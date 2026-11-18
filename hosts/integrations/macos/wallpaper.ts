import type { Host } from "tsinfra"

/**
 * Sets `imagePath` as the desktop picture. Pass the file itself, not a symlink, because Finder reports the symlink's
 * target.
 */
export const wallpaper = async (h: Host, imagePath: string) =>
  h.ensure("Wallpaper", {
    want: imagePath,
    check: `osascript -e 'tell application "Finder" to get POSIX path of (desktop picture as alias)'`,
    // Use System Events, because `m wallpaper` resets the wallpaper store afterward and the old picture comes back.
    fix: `osascript -e 'tell application "System Events" to tell every desktop to set picture to "${imagePath}" as POSIX file'`,
  })
