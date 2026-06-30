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

**Git LFS:** `public/touring-new-harvous-share.mp4` (~371 MB) is tracked with Git LFS. Enable [Netlify Git LFS support](https://docs.netlify.com/git/large-media/setup/) (or ensure LFS files are fetched at build time) so the hero video is present in `dist/`.

**Node:** Use Node 22 locally (see `.nvmrc` and `netlify.toml`). Netlify sets `NODE_VERSION = "22"`.

## Data files

Release notes and compare pages read from CSV at build time:

- `data/compare.csv` — competitor comparison content
- `data/webflow-changelog.csv` — release notes (migrated from Webflow)

Update these files and redeploy to publish changes. No monorepo dependencies.

## App links

Sign-up, sign-in, support, and status links point to absolute URLs on the app and status subdomains (`app.harvous.com`, `status.harvous.com`), not routes in this repo.
