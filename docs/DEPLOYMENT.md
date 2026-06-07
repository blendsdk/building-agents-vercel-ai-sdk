# Deployment Checklist (GitHub Pages)

This is a **one-time** manual setup to publish the VitePress site to GitHub Pages
via GitHub Actions. The workflow lives at `.github/workflows/deploy.yml` and runs
automatically on every push to `main`.

## One-time setup

1. Create the repo **`building-agents-vercel-ai-sdk`** under the **blendsdk**
   org (public).
2. Add the remote and push `main`:
   ```bash
   git remote add origin https://github.com/blendsdk/building-agents-vercel-ai-sdk.git
   git push -u origin main
   ```
   > ⚠️ Per the execution plan (PF-001), don't push `main` until the Phase 1
   > tests land (or the Ship phase). The CI `test` job uses `--passWithNoTests`
   > so it stays green before then, but holding the first push avoids spending
   > Actions minutes on an incomplete site.
3. **Settings → Pages → Build and deployment → Source:** select **"GitHub Actions"**.
4. **Settings → Actions → General → Workflow permissions:** allow read/write if
   prompted. (The workflow already declares scoped `pages: write` and
   `id-token: write`.)
5. Wait for the **"Deploy Docs to GitHub Pages"** workflow to finish (Actions tab).
6. Visit the live site:
   **https://blendsdk.github.io/building-agents-vercel-ai-sdk/**

## How the workflow works

| Job | What it does |
| --- | ------------ |
| `test` | `yarn install --frozen-lockfile` then `yarn test --passWithNoTests` — deterministic, no network, gates the build. |
| `build` | Builds the VitePress site and uploads `docs/.vitepress/dist` as a Pages artifact. |
| `deploy` | Publishes the artifact to the `github-pages` environment. |

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| 404 / broken CSS & JS on the live site | Confirm `base` is `/building-agents-vercel-ai-sdk/` in `docs/.vitepress/config.ts` and that `docs/public/.nojekyll` exists. |
| Workflow can't deploy Pages | Ensure **Pages → Source = "GitHub Actions"** and workflow permissions allow it. |
| `test` job fails | Fix the failing tests — the build is gated on a green `test` job. |
| Push rejected | Confirm the `origin` remote and that you're pushing the `main` branch. |
