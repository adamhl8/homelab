#!/bin/bash

[ -z $1 ] && echo "Please provide a name." && exit

set -uo pipefail
IFS=$'\n\t'

name=$1

root=~/homelab
common=${root}/common
main=${root}/main
modules=${main}/${name}

source ${common}/prompts.sh

source ${main}/${name}.sh

for i in $(seq 1 ${steps}); do
step=step${i}

[ -f ~/${step} ] && continue

echo "Running ${name} ${step}..."
${step}
touch ~/${step}
echo "${name} ${step} complete."

[ ${i} != ${steps} ] && reboot_prompt
done

rm ~/step*
echo "Finished running ${name}."

reboot_prompt