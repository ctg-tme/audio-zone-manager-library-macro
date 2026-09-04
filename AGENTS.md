# Agent guidance

## Project purpose

This repository contains the Cisco RoomOS Audio Zone Manager (AZM) library and example macros/configurations. AZM turns audio activity from codec inputs or external producers into zone state and asset-bearing callbacks for RoomOS macro authors.

## Before changing code

1. Read `CONTEXT.md` for the project's canonical domain language.
2. Read `docs/agents/project-map.md` to understand the repository's runtime boundaries.
3. Read `docs/agents/backwards-compatibility.md` before changing `AZM_Lib.js`, sample configurations, `manifest.json`, or public documentation.
4. Read relevant ADRs under `docs/adr/` if that directory exists.
5. Treat `README.md` as user-facing API documentation and the legacy README as historical compatibility evidence.

## Working assumptions

- `AZM_Lib.js` runs inside a Cisco RoomOS macro and depends on the device-provided `xapi` module. It is not a normal Node.js package.
- The public export is the named ES module export `{ AZM }`.
- There is currently no package manager, build system, or automated test harness in this repository. Prefer small, deterministic validation scripts or static checks that do not require RoomOS.
- The source of truth for a release is the set of root-level distributable files plus the matching `manifest.json`; keep the library's internal `version` and manifest version aligned when releasing.
- Preserve existing public names, accepted aliases, state strings, payload properties, and setup ordering unless a deliberate breaking change is explicitly approved and documented.
- Do not activate the library macro on a codec; it is imported by an application macro.
- Changes to RoomOS xAPI paths, minimum RoomOS versions, or external payloads require documentation updates and compatibility review.

## Compatibility-first workflow

- Identify the existing contract before refactoring. Do not rename a public API merely to improve style.
- When adding behavior, make it additive where possible and retain old configuration shapes and connector aliases.
- Keep device I/O at the RoomOS boundary. Code that can be reasoned about without a codec should remain testable with stubs or fixtures.
- Verify syntax and inspect the diff before committing. If a behavior cannot be tested without RoomOS, state that limitation clearly.
- Update `README.md`, samples, and `manifest.json` only when their documented or released behavior changes; do not silently rewrite historical files.

## Git policy

- Work on a non-`main` branch prefixed with `codex/` unless the user requests another branch.
- The user handles merges to `main`.
- Commit focused changes with a descriptive message. Push only non-`main` branches when requested or authorized by the user.
- Never use destructive commands such as `git reset --hard`, `git clean`, or force-push without explicit authorization.

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues and should be managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the standard five triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with one root `CONTEXT.md` and shared ADRs under `docs/adr/`. See `docs/agents/domain.md`.
