#!/usr/bin/env fish

function get_arch
  set -l arch amd64
  if test (arch) = "aarch64"
    set arch arm64
  end
  echo $arch
end
