#!/bin/bash

[ -z $1 ] && echo "Please provide a name." && exit

set -euo pipefail
IFS=$'\n\t'

name=$1

root=~/homelab
common=${root}/common
main=${root}/main
modules=${main}/${name}

source ${common}/functions.sh

source ${main}/${name}.sh

for i in $(seq 1 ${steps}); do
step=step${i}

[ -f ~/${step} ] && continue
touch ~/${step}
echo "Running ${name} ${step}..."
${step}

[ ${i} != ${steps} ] && exit
done

rm ~/step*
echo "Finished running ${name}."