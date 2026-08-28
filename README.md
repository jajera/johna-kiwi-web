# johna-kiwi-web

Main site for [johna.kiwi](https://johna.kiwi). Hosted on AWS Amplify (wired from `platformfuzz/johna-kiwi-infra` in Phase 2).

## Status

Scaffold only. Content and stack choices land here before Amplify DNS (apex / `www`) is associated.

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

## Related

- DNS / subdomain registry: [platformfuzz/johna-kiwi-infra](https://github.com/platformfuzz/johna-kiwi-infra)
- GitHub Pages subs: `*.johna.kiwi` via `sites.yaml` in the infra repo
