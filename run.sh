#!/bin/bash

[ -z $1 ] && echo "Please provide a name." && exit

set -o pipefail
IFS=$'\n\t'

sudo -v

name=$1

modules=~/homelab/main/${name}

source ~/homelab/utils/prompts.sh

source ~/homelab/main/${name}.sh

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