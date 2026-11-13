import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

plan host:
    @echo "{{ style('command', 'uv run pyinfra inventory.py ' + host + '/deploy.py --limit ' + host + ' --dry --diff') }}"
    @cd pyinfra && uv run pyinfra inventory.py {{ host }}/deploy.py --limit {{ host }} --dry --diff --json | \
        jq -r '[.plan[] | select(.hosts_with_change != [] or .hosts_with_conditional_change != [])] | \
        if length == 0 then "No changes." else "\(length) pending change(s):", (.[] | "  \(.name)") end'

apply host:
    cd pyinfra && uv run pyinfra inventory.py {{ host }}/deploy.py --limit {{ host }} -y

# build Free My TV for the living room TV, then install it with `just tv-install`
tv-build:
    bun tv/build.ts

tv-install:
    bun tv/build.ts --install

# find which defaults key a settings toggle maps to (from yannbertrand/macos-defaults diff.sh)
defaults-diff:
    #!/usr/bin/env bash
    dir=$(mktemp -d)
    defaults read > "$dir/old"
    defaults -currentHost read > "$dir/host-old"
    read -n 1 -s -r -p "Change a setting now, then press any key..."
    echo
    defaults read > "$dir/new"
    defaults -currentHost read > "$dir/host-new"
    git --no-pager diff --no-index "$dir/old" "$dir/new" || true
    git --no-pager diff --no-index "$dir/host-old" "$dir/host-new" || true

lint: _lint
    cd pyinfra && uv run ruff check --fix .
    cd pyinfra && uv run ruff format .
    cd pyinfra && uv run ty check

bump-deps: _bump-deps
    cd pyinfra && uv sync --upgrade
