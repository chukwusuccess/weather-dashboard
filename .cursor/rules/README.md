# Cursor Rules — Portable Ruleset

A project-agnostic ruleset for Cursor. Drop this whole `.cursor/rules/` folder
into any repo and it works immediately — nothing here is specific to one project.

## How Cursor loads these

Each `.mdc` file's frontmatter decides when it enters the AI's context:

| Rule | Trigger | Cost |
|---|---|---|
| `000-core.mdc` | **Always** (every request) | paid every chat — kept tight |
| `010-workflow.mdc` | **Always** (every request) | paid every chat — kept tight |
| `015-deep-reasoning.mdc` | **Always** (every request) | paid every chat — kept tight |
| `080-security.mdc` | **Always** (every request) | paid every chat — kept tight |
| `020-code-quality.mdc` | Auto — any source file in context | free until relevant |
| `030-frontend.mdc` | Auto — html/css/jsx/tsx/vue/svelte | free until relevant |
| `040-typescript-js.mdc` | Auto — ts/tsx/js/jsx | free until relevant |
| `050-backend-api.mdc` | Auto — api/server/routes/db paths | free until relevant |
| `060-python.mdc` | Auto — .py files | free until relevant |
| `070-testing.mdc` | Auto — test files | free until relevant |
| `090-git.mdc` | Agent-requested — commits/branches/PRs | fetched on demand |
| `100-performance.mdc` | Agent-requested — perf/optimization tasks | fetched on demand |
| `110-docs.mdc` | Auto — markdown/docs | free until relevant |

Only four rules are always-on. Everything else attaches by file type or is
pulled in by the agent when its description matches the task. This keeps the
context small (better answers, faster, cheaper) while still covering every
domain when it matters.

## Making it global (all of Cursor, every project)

Cursor has no global `.mdc` directory — two options:

1. **User Rules (recommended)** — open
   `USER-RULES-paste-into-cursor-settings.md`, copy the section below the
   line into **Cursor → Settings → Rules → User Rules**. That's the condensed
   core that follows you into every project, even ones without this folder.
2. **Copy the folder** — `cp -r .cursor/rules <other-project>/.cursor/rules`
   for the full detailed set per project. Keep a master copy somewhere (e.g.
   a dotfiles repo) and sync from there.

Use both: User Rules as the global floor, this folder as the per-project
detail layer.

## Relationship to the ignore files

The repo root also carries two index-control templates, both portable:

- **`.cursorignore`** — blocks files from Cursor's index AND from AI access.
  Secrets, dependencies, build output, binaries, junk. Best-effort protection,
  not a security boundary.
- **`.cursorindexingignore`** — blocks files from the search index only; the AI
  can still read them deliberately. Lockfiles, generated code, snapshots, bulk
  data — noise in search, occasionally useful on purpose.

Both have a marked "per-project additions" section at the bottom; keep the
template part generic when syncing across repos.

## Relationship to AGENTS.md

The repo root also has an `AGENTS.md` — the open-standard agent guide read by
Cursor, Codex, Claude Code, and most other coding agents. It's the condensed,
single-file version of this ruleset plus a "This Project" section for
repo-specific facts. Copy it alongside this folder when porting to a new repo:
`.cursor/rules/` gives Cursor fine-grained, context-efficient loading;
`AGENTS.md` covers every other agent (and Cursor reads it too). When updating
a convention, update it in both places.

## Adding project-specific rules

Create new numbered files rather than editing the portable ones, e.g.
`200-this-project.mdc` with your stack choices, domain vocabulary, and
"never touch X" constraints. The 000–110 range stays generic and syncable;
200+ is yours per project.

## Frontmatter cheat-sheet

```yaml
---
description: Shown to the agent so it can decide to fetch the rule.
globs: *.ts,*.tsx        # auto-attach when matching files are in context
alwaysApply: true        # inject into every request (use sparingly)
---
```

- Always: `alwaysApply: true`
- Auto-attached: `globs` set, `alwaysApply: false`
- Agent-requested: `description` only, no globs, `alwaysApply: false`
- Manual (@-mention only): no description, no globs
