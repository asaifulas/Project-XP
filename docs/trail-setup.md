# Trail setup — 2-minute playbook

`trail` is the old `graft` (same graph, renamed; both packages were `@nanonets/graft`
and `@trailhq/trail-code`). Copy this file into a new repo, or just paste the prompt.

## Cheapest path: paste this to the agent

```
Set up trail in this repo. Run these three, in order:
  npm i -g @trailhq/trail-code@latest
  trail init --agents cursor agents --no-global
  trail build
Then verify with `trail build --check` (must print "graph check: OK") and
`trail ask "<a real question about this repo>" --source` (must return hits, not
"no matching nodes"). Print only the last line of each command plus any failure.
Do not read source files, do not re-run a step that already passed.
```

~80 tokens. The agent skips discovery entirely because the steps and the two
failure signatures ("NO GRAPH", "no matching nodes") are already named.

## Manual, no agent

```sh
npm i -g @trailhq/trail-code@latest   # 0.23+; drop any old @nanonets/graft install
trail init --agents cursor agents --no-global   # wires editor + AGENTS.md
trail build                                     # $0, no API key, ~1s/100 files
trail build --check                             # must say "graph check: OK"
trail ask "where is <symbol>" --source          # must return file:line, not empty
```

`--deep` adds LLM concept nodes (`trail build --deep`, needs a provider key). The
wiring graph alone is the useful 90%; skip `--deep` unless you want prose summaries.

## Traps that each cost real time in 0.23

| Trap | What actually happens | Fix |
|---|---|---|
| `graft/` vs `.trail/cache/` | Map dir is brand-aware: `.trail/cache` if it or `.trail/learnings` exists (or the repo is wired for trail), else `graft/`. Old `graft/` maps auto-migrate. | Don't hard-code a path; `GRAFT_DIR` overrides. |
| Bare `trail check` | In 0.23 it checks **team learnings/conflicts**, not graph drift. Returns "nothing bears on this change" — looks like success. | Graph drift is `trail build --check`. |
| Hand-written hook shim | A shim calling a `graft-hooks.cjs` that init never created fails **silently** — orientation never injects, nobody notices. | Let `init` generate `.cursor/hooks/trail-hooks.cjs`; point hooks at *that*. |
| `init --agents <subset>` | It **retracts** other hosts. If AGENTS.md held only trail's fenced block, narrowing to `cursor` empties and deletes the file. | Always include `agents` in the list. |
| Missing `--no-global` | Writes `~/.codex/config.toml`; in a sandboxed shell that's `EPERM` and aborts before repo wiring. | Pass `--no-global` unless you want global configs. |
| Old global bin | `which graft` still resolves to the 0.22 package, which looks in `graft/` and reports `NO GRAPH` forever. | `npm uninstall -g @nanonets/graft`; confirm `command -v graft` is empty. |
| Stale scoreboard | Session stats from the old brand read `graft reads: 0` even after you query. | `rm -f .trail/cache/.cache/session/*.json .trail/cache/.cache/stats.json`. |
| Hook stdout | Any build chatter on stdout makes Cursor reject the hook JSON. | `exec` the shim; send build output to `/dev/null`. |
| Hook PATH | Cursor hooks run in a non-login shell and miss `~/.local/bin`. | `export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"`. |
| Staleness mid-session | The sessionStart hook only checks **once** per session. | After a big refactor: `trail build` again (cheap, incremental). |

## What "wired" looks like

```
.cursor/hooks.json              sessionStart / postToolUse / sessionEnd
.cursor/hooks/trail-hooks.cjs   generated shim (host-aware)
.cursor/rules/trail.mdc         alwaysApply: true — tells the model to query first
.cursor/mcp.json                trail mcp server
AGENTS.md                       "Trail — repo context graph" block
.trail/README.md, learnings/    committable
.trail/cache/                   git-ignored graph (`.trail/.gitignore` owns it)
```

## Keeping it honest

- Only Cursor is instrumented by `trail stats`; other harnesses just follow
  `AGENTS.md`, so verify with transcripts (`grep '"command".*trail ask'`), not stats.
- A query prints its own `tokens saved ≈ N` line — that is the per-turn receipt.
- Trail wins on *finding and understanding* code (often 90%+ of the file-reading
  cost). It buys nothing on a one-line edit in a file you already have open, or
  when the graph is stale — rebuild before trusting it.
