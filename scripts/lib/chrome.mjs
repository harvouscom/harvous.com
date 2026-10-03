/**
 * A small headless-Chrome driver over the DevTools protocol — no dependency,
 * just the WebSocket built into Node 22.
 *
 * The OG cards need two things sharp can't do: set type the way the site does
 * (Google Sans Flex with its axes, real tracking, balanced line breaks — pango
 * gets none of these right), and photograph a live page's hero. One browser
 * serves every card, so a full run is a few seconds per card, not per launch.
 *
 * Chrome is found at CHROME_PATH, else the usual install locations.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

export const ROOT = join(import.meta.dirname, "../..");

/** file:// URL for a path under public/, for use inside templates. */
export function publicUrl(rel) {
  return pathToFileURL(join(ROOT, "public", rel.replace(/^\//, ""))).href;
}

export async function launchChrome() {
  const bin = CANDIDATES.find((p) => existsSync(p));
  if (!bin) throw new Error("Chrome not found — set CHROME_PATH to a Chrome/Chromium binary.");

  const dir = mkdtempSync(join(tmpdir(), "harvous-og-"));
  const proc = spawn(bin, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${join(dir, "profile")}`,
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-color-profile=srgb",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ]);

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error("Chrome did not start within 20s.")), 20000);
    proc.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on("exit", (code) => reject(new Error(`Chrome exited early (${code}).`)));
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => {
    ws.onopen = r;
    ws.onerror = j;
  });

  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message} ${msg.error.data ?? ""}`)) : resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const cmd = (method, params) => send(method, params, sessionId);
  await cmd("Page.enable");
  await cmd("Runtime.enable");

  const once = (method, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        listeners.delete(fn);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeout);
      const fn = (msg) => {
        if (msg.sessionId === sessionId && msg.method === method) {
          clearTimeout(t);
          listeners.delete(fn);
          resolve(msg.params);
        }
      };
      listeners.add(fn);
    });

  const page = {
    /** CSS-pixel viewport, rendered at `scale`× device pixels. */
    async viewport(width, height, scale = 2) {
      await cmd("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
    },
    /** Reduced motion freezes the cycling pills and skips entrance animations. */
    async reducedMotion() {
      await cmd("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-motion", value: "reduce" },
          { name: "prefers-color-scheme", value: "light" },
        ],
      });
    },
    async goto(url) {
      const loaded = once("Page.loadEventFired", 60000);
      const res = await cmd("Page.navigate", { url });
      if (res.errorText) throw new Error(`${url}: ${res.errorText}`);
      await loaded;
      // Web fonts and decoded images, then two frames for layout to settle.
      // Lazy images below the fold never start, so their decode() never settles:
      // only wait on the ones already loading, and never for more than 8s.
      await page.eval(
        `Promise.race([
          Promise.all([
            document.fonts.ready,
            ...[...document.images].filter((i) => i.loading !== "lazy" || i.complete).map((i) => i.decode().catch(() => {})),
          ]),
          new Promise((r) => setTimeout(r, 8000)),
        ]).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))`,
      );
    },
    /** Load a full HTML document (written to a temp file so file:// fonts and images resolve). */
    async setContent(html) {
      const file = join(dir, `page-${++id}.html`);
      writeFileSync(file, html);
      await page.goto(pathToFileURL(file).href);
      rmSync(file, { force: true });
    },
    async eval(expression) {
      const r = await cmd("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    },
    async css(text) {
      await page.eval(`(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(text)}; document.head.append(s); })()`);
    },
    /** PNG of a CSS-pixel rect of the document (not just the viewport), at the viewport's scale × `scale`. */
    async screenshot(clip, scale = 1) {
      const { data } = await cmd("Page.captureScreenshot", {
        format: "png",
        ...(clip ? { clip: { ...clip, scale }, captureBeyondViewport: true } : {}),
      });
      return Buffer.from(data, "base64");
    },
  };

  return {
    page,
    async close() {
      try {
        await send("Browser.close");
      } catch {}
      ws.close();
      // Chrome is still writing its profile as it exits; wait, then clear it.
      if (proc.exitCode === null) {
        await new Promise((r) => {
          proc.once("exit", r);
          setTimeout(() => (proc.kill(), r()), 3000);
        });
      }
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    },
  };
}
