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

**Video:** the two videos ship in `public/` (Git LFS) **and** live in the R2 bucket `harvous-com-media`. That duplication is deliberate and temporary.

Netlify serves them as ordinary files, with byte-range support, and can only serve what is in the build. Cloudflare cannot: Workers static assets sets `Accept-Ranges` on nothing and answers every Range request with the whole file, which leaves `video.seekable` empty in the browser — a viewer cannot skip ahead in the five-minute tour. So on Cloudflare the Worker claims those paths via `run_worker_first` and serves them from R2 with the Range header passed through, and the copy in `dist/` is never read. See `serveMedia` in [`cloudflare/worker.ts`](cloudflare/worker.ts).

After changing a video, upload it and then deploy:

```bash
npm run media:upload
```

**After the DNS cutover:** delete the videos from `public/`, drop the LFS step from the deploy workflow, and the duplication goes with them.

**Node:** Use Node 22 locally (see `.nvmrc` and `netlify.toml`). Netlify sets `NODE_VERSION = "22"`.

## Church interest form

`/for/churches/` carries the one form on the site. It posts to its own URL —
Netlify Forms' convention — and both hosts honour that: Netlify scrapes and
stores it as it always has, and on Cloudflare the Worker intercepts the POST
before the asset router can answer it with the page.

Cloudflare has no equivalent of Netlify Forms, so submissions go to a D1 table
instead. Only what the visitor typed is stored — no IP, no user agent.

```bash
npx wrangler d1 execute harvous-com --remote \
  --command "select created_at, name, email, church_name, interests from church_interest order by created_at desc limit 20"
```

Schema lives in [`cloudflare/migrations/`](cloudflare/migrations/); CI applies
pending migrations before each deploy. Validation is in
[`src/lib/church-interest.ts`](src/lib/church-interest.ts) — a submission that
fails it is rejected with a reason rather than stored half-formed, and a
honeypot hit is answered like a success and stored nowhere.

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
