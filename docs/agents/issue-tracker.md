# Issue tracker: GitHub

Issues and PRDs for this repository live as GitHub Issues. Use the `gh` CLI for issue operations; infer the repository from the GitHub remote while inside this clone.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue with `gh issue view <number> --comments` and include labels when triaging.
- List issues with appropriate `--state` and `--label` filters.
- Apply or remove labels with `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close an issue with `gh issue close <number> --comment "..."`.

When a skill says to publish a plan, PRD, or issue, create a GitHub issue rather than a local markdown issue.
