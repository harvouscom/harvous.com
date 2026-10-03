/**
 * The app repo's star count, read from GitHub's public API at build time, so the
 * number on the site is as fresh as the last deploy. One request per build,
 * however many places show it.
 *
 * Never fails the build: no network, a rate limit (60 unauthenticated calls an
 * hour), or a slow response all give `null`, and callers leave the count out.
 * Set GITHUB_TOKEN in the build environment to lift the rate limit.
 */
const REPO = "harvouscom/harvous";

let cached: Promise<number | null> | undefined;

export function getRepoStars(): Promise<number | null> {
  cached ??= (async () => {
    try {
      const token = process.env.GITHUB_TOKEN;
      const res = await fetch(`https://api.github.com/repos/${REPO}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "harvous.com-build",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { stargazers_count?: unknown };
      return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    } catch {
      return null;
    }
  })();
  return cached;
}

/** 18 → "18", 1234 → "1.2k". */
export function formatStars(n: number): string {
  return n < 1000 ? String(n) : `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
}
