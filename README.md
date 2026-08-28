# johna-kiwi-web

Main site for [johna.kiwi](https://johna.kiwi), hosted on AWS Amplify.

| Environment | Git branch | URL |
|-------------|------------|-----|
| Production | `main` | [https://johna.kiwi](https://johna.kiwi) (www redirects here) |
| Staging | `staging` | [https://staging.johna.kiwi](https://staging.johna.kiwi) |
| PR preview | pull request | `https://pr-<n>.<app-id>.amplifyapp.com` |

Build config: [`amplify.yml`](amplify.yml). Non-`main` deploys write a `robots.txt`
that disallows indexing.

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

Amplify auto-builds on push. Do not open feature PRs against `main`.

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

Local preview:

```bash
python3 -m http.server 8080
```

## Branch protection

Rulesets live in [`.github/rulesets/`](.github/rulesets/). Create or update with:

```bash
./scripts/apply-branch-rulesets.sh --enforce
```
