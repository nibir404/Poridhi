# Releasing

- Branch from `main` for each change (`feat/…`, `fix/…`), open a pull request, merge to `main`.
- Versions follow semantic versioning. Bump `version` in `package.json`, add an entry to `CHANGELOG.md`, then tag:

```bash
git tag -a v0.2.0 -m "v0.2.0"
```

```bash
git push origin main --tags
```

- MAJOR: breaking route or data changes. MINOR: new screens or flows. PATCH: fixes and visual tweaks.
