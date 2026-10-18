#!/bin/sh
# Cursor sessionStart -> refresh the trail graph if it is stale, then inject the
# context-graph orientation.
#
# Why a shell shim and not the node hook directly:
#  1. PATH. Cursor spawns hooks from a non-login shell that does not inherit the
#     login shell's PATH. `node` and `trail` both live in ~/.local/bin here.
#  2. Staleness. A stale graph is worse than no graph: the agent asks trail,
#     gets yesterday's line numbers, and falls back to reading whole files --
#     exactly the token spend trail exists to avoid. `trail build --check` is
#     content-hash based (~0.3s), so the common fresh case never rebuilds and
#     two sessions starting at once cannot race a build. (Note: bare
#     `trail check` is NOT this -- in trail >=0.23 it checks team learnings.)
#  3. stdout. It must contain ONLY the shim's hook JSON: trail's build chatter
#     goes to /dev/null, and the shim is exec'd so it owns the process.
#
# ~/.local/bin holds this machine's real `node` and `trail`.
PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
export PATH

repo=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd) || exit 0
cd "$repo" || exit 0

if command -v trail >/dev/null 2>&1; then
  trail build --check >/dev/null 2>&1 || trail build >/dev/null 2>&1
fi

command -v node >/dev/null 2>&1 || exit 0
exec node "$repo/.cursor/hooks/trail-hooks.cjs" session-start
