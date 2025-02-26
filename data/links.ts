const links = [
  { source: "configs/config.fish", dest: "~/.config/fish/" },
  { source: "configs/ghostty", dest: "~/.config/ghostty/" },
  { source: "configs/.gitconfig", dest: "~/" },
  { source: "configs/secrets.yaml", dest: "~/" },
  { source: "configs/.bunfig.toml", dest: "~/" },
  { source: "configs/authorized_keys", dest: "~/.ssh/" },
  { source: "configs/allowed_signers", dest: "~/.ssh/" },
  { source: "hosts/macbook/.wezterm.lua", dest: "~/" },
  { source: "hosts/macbook/.gitconfig-swf", dest: "~/" },
  { source: "hosts/macbook/.prettierrc.mjs", dest: "~/" },
  { source: "hosts/macbook/DefaultKeyBinding.dict", dest: "~/Library/KeyBindings/" },
  { source: "hosts/macbook/bin/*", dest: "~/bin/" },
]

export { links }
