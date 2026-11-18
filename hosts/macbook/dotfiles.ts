import { PRIVATE_FILE_MODE } from "tsinfra"

import type { LinkSource } from "#hosts/integrations/files.ts"

/** Each path on the macbook, mapped to its source under `hosts/`. Sources without a mode get 644. */
export const DOTFILES = {
  "~/.gitconfig": "files/.gitconfig",
  "~/.prettierrc.mjs": "files/.prettierrc.mjs",
  "~/.config/micro/bindings.json": "files/micro_bindings.json",
  "~/.config/starship.toml": "files/starship.toml",
  "~/.config/fish/config.fish": "files/config.fish",
  "~/.config/fish/fish_plugins": "files/fish_plugins",
  "~/.config/zed/settings.json": "files/zed/settings.json",
  "~/.config/zed/keymap.json": "files/zed/keymap.json",
  "~/.config/zed/tasks.json": "files/zed/tasks.json",
  "~/.config/zed/snippets/typescript.json": "files/zed/snippets/typescript.json",
  "~/.config/ghostty/config": "macbook/files/ghostty",
  "~/Library/KeyBindings/DefaultKeyBinding.dict": "macbook/files/DefaultKeyBinding.dict",
  "~/.config/git/ignore": "macbook/files/git-ignore",
  "~/.config/codebook/codebook.toml": "macbook/files/codebook.toml",
  // Use owner-only like gh, which writes its config files 600 because the same directory can hold tokens.
  "~/.config/gh/config.yml": { source: "macbook/files/gh-config.yml", mode: PRIVATE_FILE_MODE },
  "~/.claude/settings.json": "macbook/files/claude/settings.json",
  "~/.claude/CLAUDE.md": "macbook/files/claude/CLAUDE.md",
  "~/.claude/commands/organize-stars.md": "macbook/files/claude/commands/organize-stars.md",
  // Use owner-only because `ssh_config(5)` asks for it, and the file maps out hosts, users, and keys.
  "~/.ssh/config": { source: "files/ssh_config", mode: PRIVATE_FILE_MODE },
  "~/.ssh/allowed_signers": "files/allowed_signers",
  // Use owner-only for both because `aws configure` creates them 600.
  "~/.aws/config": { source: "files/aws_config", mode: PRIVATE_FILE_MODE },
  "~/.aws/credentials": { source: "files/aws_credentials", mode: PRIVATE_FILE_MODE },
} satisfies Record<string, LinkSource>
