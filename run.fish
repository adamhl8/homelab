#!/usr/bin/env fish

set -l name $argv[1]

if test -z "$name"
  echo "Please provide a name."
  return 1
end

set -g HOMELAB_ROOT (realpath (status dirname))
set -l main $HOMELAB_ROOT/main/"$name".fish
set -g modules $HOMELAB_ROOT/main/$name
set -g common $HOMELAB_ROOT/common

source $HOMELAB_ROOT/utils/prompts.fish
source $HOMELAB_ROOT/utils/helpers.fish

if not test -x "$main"
  echo "Script $main does not exist or is not executable."
  return 1
end

cd ~/

sudo -v

source $main

set -l step_count 1
while test "$(type -t "step"$step_count 2>/dev/null)" = "function"

  set -l current_step "step"$step_count

  if test -e $HOMELAB_ROOT/$current_step
    set step_count (math $step_count + 1)
    continue
  end

  echo "Running $name $current_step..."
  $current_step

  touch $HOMELAB_ROOT/$current_step
  echo "$name $current_step complete."
  reboot_prompt; or return 0
end

echo "Finished running $name."
rm $HOMELAB_ROOT/step*
