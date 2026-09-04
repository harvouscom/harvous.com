# harvous.com

Astro marketing site for [harvous.com](https://harvous.com). Deployed separately from the Harvous app at [app.harvous.com](https://app.harvous.com).

## Build

```bash
npm ci
npm run build
```

Output is written to `dist/`. Preview locally with `npm run preview`.

## Deploy

Netlify builds from the repo root (`netlify.toml` at project root). Connect this repo in the Netlify dashboard and point the `harvous.com` domain to the site.

**Git LFS:** `*.mp4` is tracked with Git LFS, and the build must fetch it — a checkout that skips LFS ships pointer files, so the site would serve a few hundred bytes of text as its video. Netlify needs [Git LFS support](https://docs.netlify.com/git/large-media/setup/) enabled; the Cloudflare workflow runs `git lfs pull --include="public/*.mp4"`.

Only `public/` ships. The founder tour's source footage lives in [`video/footage/`](video/) because it is a render input, not a site asset — and at 371 MB it is well past Cloudflare's 25 MiB per-asset limit. The site tour CTA uses `public/touring-harvous-short.mp4`, the Remotion cut of it (see [`video/`](video/)).

**Node:** Use Node 22 locally (see `.nvmrc` and `netlify.toml`). Netlify sets `NODE_VERSION = "22"`.

## Data files

Release notes and compare pages read from CSV at build time:

- `data/compare.csv` — competitor comparison content
- `data/webflow-changelog.csv` — release notes (migrated from Webflow)

Update these files and redeploy to publish changes. No monorepo dependencies.

Release notes sync automatically from the [harvous](https://github.com/harvouscom/harvous) app repo: `Changelog/*.md` exports to `data/webflow-changelog.csv` via `scripts/export-changelog-csv.js` (local post-commit hook or the `sync-release-notes` GitHub Action). Set `HARVOUS_COM_SYNC_TOKEN` in the app repo for CI pushes to this repo.

## Images

Raster assets ship as WebP (primary) with PNG/JPEG fallbacks via `OptimizedImage.astro`. Recompress after changing screenshots:

```bash
npm run images:compress   # requires Dinky CLI — see scripts/compress-images.sh
```

## App links

Sign-up, sign-in, support, and status links point to absolute URLs on the app and status subdomains (`app.harvous.com`, `status.harvous.com`), not routes in this repo.

## License

Site source, copy, and assets are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [LICENSE](LICENSE).
