#!/bin/bash

[ -z $1 ] && echo "Please provide a name." && exit

set -euo pipefail
IFS=$'\n\t'

name=$1

root=~/homelab
common=${root}/common
files=${root}/files
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

[ ${i} != ${steps} ] && exit
done

rm ~/step*
echo "Finished running ${name}."

reboot_prompt