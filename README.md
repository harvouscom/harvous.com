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

## Data files

Release notes and compare pages read from CSV at build time:

- `data/compare.csv` — competitor comparison content
- `data/webflow-changelog.csv` — release notes (migrated from Webflow)

Update these files and redeploy to publish changes. No monorepo dependencies.

## App links

Sign-up, sign-in, support, and status links point to absolute URLs on the app and status subdomains (`app.harvous.com`, `status.harvous.com`), not routes in this repo.
