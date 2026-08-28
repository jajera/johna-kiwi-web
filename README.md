# johna-kiwi-web

Main site for [johna.kiwi](https://johna.kiwi). Hosted on AWS Amplify (wired from
[`platformfuzz/johna-kiwi-infra`](https://github.com/platformfuzz/johna-kiwi-infra)).

| Environment | Git branch | URL |
|-------------|------------|-----|
| Production | `main` | [https://johna.kiwi](https://johna.kiwi) (www redirects here) |
| Staging | `staging` | [https://staging.johna.kiwi](https://staging.johna.kiwi) |
| PR preview | pull request | `https://pr-<n>.<app-id>.amplifyapp.com` |

Build config: [`amplify.yml`](amplify.yml). Non-`main` deploys write a `robots.txt`
that disallows indexing.

## Status

Scaffold only. Content and stack choices land here; infra maps DNS after merge.

## Promotion flow

```text
feature branch
    |  PR targeting staging
    |  required checks: lint, markdown-lint, commitmsg-conform
    v
staging  -->  https://staging.johna.kiwi  (validate)
    |  PR targeting main
    |  same required checks
    v
main     -->  https://johna.kiwi
```

Amplify auto-builds on push. GitHub rulesets are the gate so production only
moves when a PR to `main` is green (normally a promotion PR from `staging`).

Do not open feature PRs against `main`. After the first merge, set the GitHub
default branch to `staging` so new PRs target staging automatically.

## Checks

| Check | When | What |
|-------|------|------|
| `lint` | PR + push to `main`/`staging` | `html-validate` + `stylelint` (`npm test`) |
| Markdown Lint | PR | actionsforge reusable |
| Commit Message Conformance | PR | actionsforge reusable |

```bash
npm ci
npm test
```

Local page preview:

```bash
python3 -m http.server 8080
```

## Branch protection (one-time, after CI is green)

Rulesets live in [`.github/rulesets/`](.github/rulesets/) with
`enforcement: disabled` until you turn them on.

```bash
# Create/update rulesets, still disabled — review in GitHub first
./scripts/apply-branch-rulesets.sh

# After the lint check name is visible on a PR, enable
./scripts/apply-branch-rulesets.sh --enforce
```

Then: GitHub → Settings → Rules → confirm `protect-staging` and `protect-main`.

Optional later: raise `required_approving_review_count` from `0` to `1`.

## Related

- DNS / Amplify Terraform: [platformfuzz/johna-kiwi-infra](https://github.com/platformfuzz/johna-kiwi-infra)
- GitHub Pages subs: `*.johna.kiwi` via `sites.yaml` in the infra repo
# probe 2026-08-29T11:04:18+12:00
