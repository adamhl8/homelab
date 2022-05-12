#!/bin/bash

find ~/homelab/ -type f -name "*.sh" -exec chmod 755 {} \;
find ~/homelab/ -type d -name "bin"  -exec chmod -R 755 {} \;