import type { BrowserContext } from "playwright";

/** POSTs that only read (verse text for a pill), so they always go through. */
const READ_POSTS = ["POST /api/scripture/fetch-verse"];

export type GuardEntry = { t: number; method: string; url: string; action: "allowed" | "stubbed" };

/**
 * Keeps a capture from changing Derek's real study.
 *
 * Every non-GET call to the Harvous API is answered here with an empty 200
 * unless the scene allows it. That covers visit events (which feed recall
 * ranking), Review answers, highlight writes and XP. Reads go through, so the
 * screen shows his real notes. Analytics beacons are dropped so a capture
 * doesn't count as a visit.
 */
export const installGuard = async (
  context: BrowserContext,
  {
    allow = [],
    now,
  }: {
    /** Patterns like "POST /api/notes" that may really write. */
    allow?: string[];
    now: () => number;
  },
) => {
  const log: GuardEntry[] = [];
  // Highlights made on camera live only here. The reader paints a highlight on
  // tap, then refetches the chapter; the refetch gets these rows mixed in, so
  // the colour stays on screen without anything reaching the database.
  const pretendHighlights: Record<string, unknown>[] = [];

  await context.route(/\/api\//, async (route) => {
    const req = route.request();
    const method = req.method();
    const { pathname: path } = new URL(req.url());
    if (method === "GET" && path === "/api/scripture/highlights" && pretendHighlights.length) {
      const res = await route.fetch();
      const data = await res.json().catch(() => ({}));
      const highlights = [...((data.highlights as unknown[]) ?? []), ...pretendHighlights];
      return route.fulfill({ response: res, json: { ...data, highlights } });
    }
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return route.continue();
    }
    if (method === "POST" && path === "/api/scripture/highlights" && !allow.some((a) => a.startsWith("POST /api/scripture/highlights"))) {
      const body = (req.postDataJSON() ?? {}) as Record<string, unknown>;
      const row = {
        id: `capture_${pretendHighlights.length + 1}`,
        entryKind: "highlight",
        scriptureReference: body.reference ?? null,
        highlightAccentRaw: body.accent ?? "warmAmber",
        madeWhileReading: true,
        scriptureSpanKey: body.spanKey ?? null,
        scripturePassageExcerpt: body.excerpt ?? "",
        miniNoteBody: "",
      };
      pretendHighlights.push(row);
      log.push({ t: Math.round(now()), method, url: path, action: "stubbed" });
      return route.fulfill({ status: 200, json: { success: true, highlight: row } });
    }
    const { pathname } = new URL(req.url());
    const key = `${method} ${pathname}`;
    const allowed = [...READ_POSTS, ...allow].some((pattern) => key.startsWith(pattern));
    log.push({ t: Math.round(now()), method, url: pathname, action: allowed ? "allowed" : "stubbed" });
    if (allowed) return route.continue();
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await context.route(/(usefathom\.com|cdn\.usefathom|plausible\.io|sentry\.io)/, (route) =>
    route.abort(),
  );

  return log;
};
