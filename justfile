import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

plan host:
    @echo "{{ style('command', 'uv run pyinfra inventory.py ' + host + '/deploy.py --limit ' + host + ' --dry --diff') }}"
    @cd pyinfra && uv run pyinfra inventory.py {{ host }}/deploy.py --limit {{ host }} --dry --diff --json | \
        jq -r '[.plan[] | select(.hosts_with_change != [] or .hosts_with_conditional_change != [])] | \
        if length == 0 then "No changes." else "\(length) pending change(s):", (.[] | "  \(.name)") end'

apply host:
    cd pyinfra && uv run pyinfra inventory.py {{ host }}/deploy.py --limit {{ host }} -y

lint: _lint
    cd pyinfra && uv run ruff check --fix .
    cd pyinfra && uv run ruff format .
    cd pyinfra && uv run ty check

bump-deps: _bump-deps
    cd pyinfra && uv sync --upgrade
