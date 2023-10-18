local wezterm = require 'wezterm'

local config = wezterm.config_builder()

local foreground = "#cccccc"
local background = "#181818"
local titlebar = "#444444"
local inactive_tab = "#2e2e2e"
local inactive = "#808080"
local hover = "#232323"
local selection = "#264f78"
local black = "#000000"
local red = "#cd3131"
local green = "#0dbc79"
local yellow = "#e5e510"
local blue = "#2472c8"
local purple = "#bc3fbc"
local cyan = "#11a8cd"
local white = "#e5e5e5"
local bright_black = "#666666"
local bright_red = "#f14c4c"
local bright_green = "#23d18b"
local bright_yellow = "#f5f543"
local bright_blue = "#3b8eea"
local bright_purple = "#d670d6"
local bright_cyan = "#29b8db"
local bright_white = "#e5e5e5"

config.default_prog = { '/opt/homebrew/bin/fish', '--login' }

config.font = wezterm.font {
  family = 'JetBrainsMono Nerd Font',
  harfbuzz_features = { 'calt=0', 'clig=0', 'liga=0' },
}
config.font_size = 16

config.animation_fps = 20
config.default_cursor_style = "BlinkingBar"
config.cursor_blink_rate = 500

config.window_decorations = "RESIZE"
config.hide_tab_bar_if_only_one_tab = true
config.enable_scroll_bar = true
config.hide_mouse_cursor_when_typing = false
config.mouse_wheel_scrolls_tabs = false
config.show_new_tab_button_in_tab_bar = false
config.show_tab_index_in_tab_bar = false

config.window_frame = {
  font_size = 14,
  active_titlebar_bg = titlebar,
  inactive_titlebar_bg = titlebar,
}

config.inactive_pane_hsb = {
  saturation = 0.75,
  brightness = 0.75,
}

config.colors = {
  tab_bar = {
    inactive_tab_edge = inactive,
    active_tab = {
      bg_color = background,
      fg_color = foreground,
    },
    inactive_tab = {
      bg_color = inactive_tab,
      fg_color = inactive,
    },
    inactive_tab_hover = {
      bg_color = hover,
      fg_color = inactive,
    },
    new_tab = {
      bg_color = inactive_tab,
      fg_color = inactive,
    },
    new_tab_hover = {
      bg_color = hover,
      fg_color = inactive,
    },
  },
  foreground = foreground,
  background = background,
  cursor_bg = foreground,
  cursor_border = foreground,
  selection_bg = selection,
  scrollbar_thumb = titlebar,
  split = inactive,
  ansi = {
    black,
    red,
    green,
    yellow,
    blue,
    purple,
    cyan,
    white
  },
  brights = {
    bright_black,
    bright_red,
    bright_green,
    bright_yellow,
    bright_blue,
    bright_purple,
    bright_cyan,
    bright_white
  },
}

config.enable_kitty_keyboard = true

local act = wezterm.action
config.keys = {
	{
		key = 'LeftArrow',
		mods = 'SUPER',
		action = act.SendString '\x1b[1;9D'
	},
	{
		key = 'RightArrow',
		mods = 'SUPER',
		action = act.SendString '\x1b[1;9C'
	},
	{
		key = 'LeftArrow',
		mods = 'SUPER|SHIFT',
		action = act.SendString '\x1b[1;10D'
	},
	{
		key = 'RightArrow',
		mods = 'SUPER|SHIFT',
		action = act.SendString '\x1b[1;10C'
	},
	{
		key = 'Backspace',
		mods = 'SUPER',
		action = act.SendString '\x1b[127;9u'
	},
	{
		key = 'Delete',
		mods = 'SUPER',
		action = act.SendString '\x1b[3;9~'
	},
	{
		key = 'a',
		mods = 'SUPER',
		action = act.SendString '\x1b[97;9u'
	},
	{
		key = 'z',
		mods = 'SUPER',
		action = act.SendString '\x1b[122;9u'
	},
	{
		key = 'z',
		mods = 'SUPER|SHIFT',
		action = act.SendString '\x1b[122;10u'
	},
	{
		key = '/',
		mods = 'SUPER',
		action = act.SendString '\x1b[47;9u'
	},
}

return config
