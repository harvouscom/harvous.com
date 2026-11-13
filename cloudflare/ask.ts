/**
 * POST /api/ask — answers a question about Harvous from this site's own words.
 *
 * A port of the ask endpoint on the Testament Made app sites (Dinky, Binky,
 * Slinky: functions/api/ask.js). Knowledge is /ask.json (src/pages/ask.json.ts:
 * FAQs, pricing, add-ons, features, use cases, audiences) and /llms.txt, read
 * through the assets binding. The docs that best match a question, by plain
 * word overlap, become both the model's context and the links under the
 * answer, so a link always points at a real page; the model only writes the
 * short answer.
 *
 * Streams Server-Sent Events: `sources` (JSON list), then `t` events with text,
 * then `done`. With no AI binding (or over the rate limit) it still sends the
 * sources, and a line saying so.
 */

type AskDoc = { id: string; title: string; href: string; text: string; soon?: string };
type Knowledge = { app: string; line: string; email: string; voice: string; version: string; docs: AskDoc[]; llms: string };

export type AskEnv = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Workers AI. */
  AI?: { run(model: string, inputs: Record<string, unknown>): Promise<ReadableStream | unknown> };
  /** Workers rate limiting: a few questions a minute per visitor. */
  ASK_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
};
type Ctx = { waitUntil(promise: Promise<unknown>): void };

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_Q = 280;
/** Bump when the prompt or the ranking changes, so cached answers start over. */
const PROMPT_VERSION = 6;
/** How many docs go to the model as context, and how many show as links. */
const CONTEXT_DOCS = 6;
const LINK_DOCS = 2;

// Anything that looks like a key, token or private key. Never sent to the model, never cached.
const SECRET =
  /(sk[-_](?:live|test|proj|ant)[-_A-Za-z0-9]{12,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bxox[abprs]-[A-Za-z0-9-]{10,}|\bAKIA[0-9A-Z]{16}\b|\bAIza[0-9A-Za-z_-]{30,}|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?=[A-Za-z0-9_\-+/=]*\d)(?=[A-Za-z0-9_\-+/=]*[A-Za-z])[A-Za-z0-9_\-+/=]{32,}\b)/;

const STOP = new Set(
  'a an and are as at be but by can do does for from how i if in is it its me my of on or so that the this to was what when where which who why will with you your harvous'.split(' ')
);
/** Lowercase words, minus filler (and the app's own name), with a plural 's' dropped. */
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 3 ? w.replace(/s$/, '') : w));

let knowledge: Knowledge | null = null;
async function load(env: AskEnv, origin: string): Promise<Knowledge> {
  if (knowledge) return knowledge;
  const get = async (path: string) => {
    const r = await env.ASSETS.fetch(new Request(new URL(path, origin).toString()));
    return r.ok ? r.text() : '';
  };
  const [askJson, llms] = await Promise.all([get('/ask.json'), get('/llms.txt')]);
  const site = JSON.parse(askJson || '{}');
  const loaded: Knowledge = { app: 'Harvous', line: '', email: 'derek@harvous.com', voice: '', version: '', docs: [], ...site, llms };
  knowledge = loaded;
  return loaded;
}

/**
 * Docs ranked by the question's words they contain, each word weighted by how
 * rare it is across the site (so "export" outweighs "notes", which is on every
 * page). A word in the title counts twice.
 */
let idf: Map<string, number> | null = null;
function rank(q: string, docs: AskDoc[]) {
  if (!idf) {
    const df = new Map<string, number>();
    for (const d of docs) for (const w of new Set(words(`${d.title} ${d.text}`))) df.set(w, (df.get(w) ?? 0) + 1);
    idf = new Map([...df].map(([w, n]) => [w, Math.log(1 + docs.length / n)]));
  }
  const want = [...new Set(words(q))];
  return docs
    .map((d) => {
      const title = new Set(words(d.title));
      const body = new Set(words(d.text));
      const score = want.reduce((sum, w) => sum + (idf!.get(w) ?? 0) * ((title.has(w) ? 2 : 0) + (body.has(w) ? 1 : 0)), 0);
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
const SSE_HEADERS = { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store' };

function stream(parts: string[]) {
  const enc = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        for (const p of parts) c.enqueue(enc.encode(p));
        c.close();
      },
    }),
    { headers: SSE_HEADERS }
  );
}
const say = (sources: unknown[], text: string) => stream([sse('sources', sources), sse('t', { t: text }), sse('done', {})]);

export async function handleAsk(request: Request, env: AskEnv, ctx: Ctx): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });

  // Only this site's own pages may ask (and localhost while developing).
  const self = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin) {
    const host = new URL(origin).host;
    if (host !== self.host && !/^localhost(:\d+)?$/.test(host) && !/^127\.0\.0\.1(:\d+)?$/.test(host)) {
      return new Response('Not allowed', { status: 403 });
    }
  }

  let q = '';
  try {
    q = String(((await request.json()) as { q?: unknown }).q || '').replace(/\s+/g, ' ').trim();
  } catch {
    /* empty */
  }
  if (q.length < 2 || q.length > MAX_Q) return new Response(`Ask a question of up to ${MAX_Q} characters.`, { status: 400 });

  const site = await load(env, self.origin);

  if (SECRET.test(q)) {
    return say([], "That looks like a key or password, so I didn't send it anywhere. Please don't paste secrets into websites, this one included.");
  }

  const ranked = rank(q, site.docs);
  const top = ranked.length ? ranked[0].score : 0;
  const sources = ranked
    .filter((x) => x.score * 2 >= top)
    .slice(0, LINK_DOCS)
    .map(({ d }) => ({ title: d.title, href: d.href }));

  // A few questions a minute per visitor; the cache below still answers repeats for free.
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  // Repeat questions come from the cache (with the coming-soon line, if any, already in it).
  const key = new Request(`https://ask.cache/harvous/${site.version}/p${PROMPT_VERSION}/${encodeURIComponent(q.toLowerCase())}`);
  const cache = (caches as unknown as { default: Cache }).default;
  const hit = await cache.match(key);
  if (hit) return say(sources, await hit.text());

  if (!env.AI) return say(sources, 'Answers are off right now. The links below should help.');
  if (env.ASK_LIMIT && !(await env.ASK_LIMIT.limit({ key: ip })).success) {
    return say(sources, "That's a lot of questions at once. Give it a minute, or look through the FAQ.");
  }

  /* When the best match is something not available yet, the answer opens with
     a fixed line saying so; the model is told not to repeat it. A model can't
     be trusted to remember that on every small detail question. */
  const soon = ranked[0]?.d.soon ?? '';

  const contextDocs = (ranked.length ? ranked.slice(0, CONTEXT_DOCS).map((x) => x.d) : site.docs.filter((d) => d.href.startsWith('/faq/')))
    .map((d) => `## ${d.title} (${d.href})\n${d.text}`)
    .join('\n\n');

  const system = [
    `You answer questions in the "Ask a question" box on the ${site.app} website. ${site.line} ${site.app} is made by Derek Castelli under Testament Made LLC.`,
    `Answer ONLY from the CONTEXT below. If the context doesn't cover it, say you're not sure and suggest emailing ${site.email}.`,
    'Keep answers to one to three short, complete sentences of plain text, each ending in a period. No markdown, no lists, no headings, no links. Never invent features, prices, dates, versions or promises.',
    `Voice: ${site.voice}`,
    `Never answer questions about the Bible, theology, doctrine or what a passage means, even briefly, and don't suggest emailing about them. Reply with two sentences like: "That's one to take to Scripture itself, and I can only help with ${site.app}. ${site.app} is a good place to write down what you find as you study it."`,
    `If the question has nothing to do with ${site.app} or the Bible, reply with one short, friendly sentence that steers back to what ${site.app} does. Don't suggest other websites.`,
    'Some sections are marked COMING SOON: they are not available yet. Never say they can be used now, and never give steps to set them up or sign up for them.',
    ...(soon ? [`Your answer will be shown right after this sentence: "${soon}" Don't repeat it; continue from it, in the future tense.`] : []),
    'Never ask for, repeat or store passwords, keys or personal details.',
    `\nCONTEXT\n\n${contextDocs}\n\nMORE ABOUT ${site.app.toUpperCase()}:\n${site.llms}`,
  ].join('\n');

  let ai: ReadableStream;
  try {
    ai = (await env.AI.run(MODEL, {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: q },
      ],
      stream: true,
      max_tokens: 220,
      temperature: 0.3,
    })) as ReadableStream;
  } catch {
    return say(sources, `I couldn't answer just now. Try again in a moment, or email ${site.email}.`);
  }

  // Re-emit the model's stream as our own small events, and keep the full text for the cache.
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  let full = '';
  let buf = '';
  const out = new ReadableStream({
    async start(c) {
      c.enqueue(enc.encode(sse('sources', sources)));
      if (soon) {
        full += `${soon} `;
        c.enqueue(enc.encode(sse('t', { t: `${soon} ` })));
      }
      const reader = ai.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 2);
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const j = JSON.parse(data);
            const t = typeof j.response === 'string' ? j.response : j.choices?.[0]?.delta?.content || '';
            if (t) {
              full += t;
              c.enqueue(enc.encode(sse('t', { t })));
            }
          } catch {
            /* partial line */
          }
        }
      }
      c.enqueue(enc.encode(sse('done', {})));
      c.close();
      if (full.trim()) {
        ctx.waitUntil(cache.put(key, new Response(full.trim(), { headers: { 'cache-control': 'public, max-age=604800' } })));
      }
    },
  });
  return new Response(out, { headers: SSE_HEADERS });
}
