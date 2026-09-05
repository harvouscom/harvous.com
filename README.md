# harvous.com

Astro marketing site for [harvous.com](https://harvous.com). Deployed separately from the Harvous app at [app.harvous.com](https://app.harvous.com).

## Build

```bash
npm ci
npm run build
```

Output is written to `dist/`. Preview locally with `npm run preview`.

## Deploy

Cloudflare Workers serves `harvous.com`. [`.github/workflows/cloudflare-deploy.yml`](.github/workflows/cloudflare-deploy.yml) builds and deploys on every push to `main`; the same workflow deploys staging on manual dispatch. Config is [`wrangler.jsonc`](wrangler.jsonc) — static assets from `dist/`, plus D1 and R2 for the two paths that need a server.

**Video:** the two videos the site plays live in `media/` (Git LFS) and are served from the R2 bucket `harvous-com-media`, not from the build — see `serveMedia` in [`cloudflare/worker.ts`](cloudflare/worker.ts). Workers static assets sets `Accept-Ranges` on nothing and answers every Range request with the whole file, which leaves `video.seekable` empty in the browser; R2 does ranged reads, so the Worker passes the header through and returns a real `206`.

After changing a video, upload it and then deploy:

```bash
npm run media:upload
```

Nothing in Git LFS ships, so CI does no LFS fetch.

**Node:** Use Node 22 locally (see `.nvmrc`, which CI reads via `node-version-file`).

## Church interest form

`/for/churches/` carries the one form on the site. It posts to its own URL, and
the Worker intercepts that POST before the asset router can answer it with the
page — which is why `/for/churches/` is named in `run_worker_first`.

Submissions go to a D1 table. Only what the visitor typed is stored — no IP,
no user agent.

```bash
npx wrangler d1 execute harvous-com --remote \
  --command "select created_at, name, email, church_name, interests from church_interest order by created_at desc limit 20"
```

A new submission emails [`NOTIFY_TO`](wrangler.jsonc) via Resend, best-effort:
the row is committed first and the send runs in `waitUntil`, so a bad key or a
rate limit costs a notification, never a submission. With `RESEND_API_KEY`
unset it stores and stays quiet — which is what staging does, since vars are
not inherited by named environments.

The sender is a **subdomain** (`send.harvous.com`). Verifying the root in
Resend would want an MX record on it, and the root's MX is Hey — real mail,
not to be disturbed for a notification.

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
