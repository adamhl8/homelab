#!/bin/sh

entry="./tools/${1}/index.ts"
outfile=${HOME}/bin/${1}

echo "Compiling '${entry}' to '${outfile}'..."
bun build --compile --target=bun --sourcemap=linked --minify --outfile=${outfile} ${entry}

rm -rf .*.bun-build
