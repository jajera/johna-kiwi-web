# johna-kiwi-web

<<<<<<< HEAD
Personal site for [John Ajera](https://johna.kiwi) - writing, profiles, and
platform notes. Hosted on AWS Amplify.
=======
Main site for [johna.kiwi](https://johna.kiwi), hosted on AWS Amplify.
>>>>>>> origin/main

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
<<<<<<< HEAD

## Content feeds

Amplify runs `npm run build` before deploy. That script fills the Labs and
Writing card grids in `index.html` from:

| Env var | Default (Amplify) | Fallback |
|---------|-------------------|----------|
| `CATALOGUE_URL` | `https://johna-kiwi-content.s3.ap-southeast-2.amazonaws.com/catalogue.json` | `data/catalogue.json` |
| `POSTS_URL` | `https://johna-kiwi-content.s3.ap-southeast-2.amazonaws.com/posts.json` | `data/posts.json` |

Remote failures (timeout, HTTP error, empty payload) always fall back to the
committed snapshots so the build still succeeds.

### Google Analytics (GA4)

Production Amplify sets `GA_MEASUREMENT_ID` (for example `G-XXXXXXXXXX`).
`npm run build` injects the gtag snippet into `index.html` and `404.html` when
that variable is present; staging and PR builds leave the markers empty.

```bash
GA_MEASUREMENT_ID=G-XXXXXXXXXX npm run build
```

Create a GA4 property in Google Analytics, copy the Measurement ID, then set it
on the Amplify `main` branch (Terraform `ga_measurement_id` or Console env).

Amplify CSP must allow `https://www.googletagmanager.com` and
`https://*.google-analytics.com` (see `johna-kiwi-infra` Amplify custom headers).

```bash
# Local build against live feeds
CATALOGUE_URL=https://johna-kiwi-content.s3.ap-southeast-2.amazonaws.com/catalogue.json \
POSTS_URL=https://johna-kiwi-content.s3.ap-southeast-2.amazonaws.com/posts.json \
npm run build

# Snapshot-only build
npm run build
```
=======
>>>>>>> origin/main

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
npm start
```

<<<<<<< HEAD
Serves the site at [http://localhost:8080](http://localhost:8080).

## Branch protection

=======
## Branch protection

>>>>>>> origin/main
Rulesets live in [`.github/rulesets/`](.github/rulesets/). Create or update with:

```bash
./scripts/apply-branch-rulesets.sh --enforce
```
