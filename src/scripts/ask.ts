/**
 * "Ask a question about Harvous": binds every [data-ask] (AskHarvous.astro) to
 * /api/ask (cloudflare/ask.ts), which streams Server-Sent Events: `sources`,
 * then `t` text, then `done`. A port of family-ask.js on the Testament Made app
 * sites.
 */

// Same check as the server: anything that looks like a key never leaves the page.
const SECRET =
  /(sk[-_](?:live|test|proj|ant)[-_A-Za-z0-9]{12,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bxox[abprs]-[A-Za-z0-9-]{10,}|\bAKIA[0-9A-Z]{16}\b|\bAIza[0-9A-Za-z_-]{30,}|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?=[A-Za-z0-9_\-+/=]*\d)(?=[A-Za-z0-9_\-+/=]*[A-Za-z])[A-Za-z0-9_\-+/=]{32,}\b)/;

type Source = { title: string; href: string };

function bind(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>("[data-ask-form]");
  const input = form?.querySelector<HTMLInputElement>("input[name=q]");
  const answer = root.querySelector<HTMLElement>("[data-ask-answer]");
  const text = root.querySelector<HTMLElement>("[data-ask-text]");
  const src = root.querySelector<HTMLElement>("[data-ask-src]");
  if (!form || !input || !answer || !text || !src) return;

  let ctrl: AbortController | null = null;

  const showSources = (list: Source[]) => {
    src.replaceChildren(
      ...list.map((s) => {
        const a = document.createElement("a");
        a.href = s.href;
        a.textContent = s.title;
        return a;
      })
    );
    src.hidden = list.length === 0;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const q = input.value.replace(/\s+/g, " ").trim().slice(0, 280);
    if (q.length < 2) return;

    ctrl?.abort();
    ctrl = new AbortController();
    const mine = ctrl;
    const timer = setTimeout(() => mine.abort(), 20000);

    answer.hidden = false;
    text.textContent = "";
    showSources([]);

    if (SECRET.test(q)) {
      text.textContent = "That looks like a key or password, so I didn't send it anywhere. Please don't paste secrets into websites, this one included.";
      clearTimeout(timer);
      return;
    }

    root.classList.add("is-busy");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q }),
        signal: mine.signal,
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const ev = /^event: (.+)$/m.exec(block)?.[1];
          const data = /^data: (.*)$/m.exec(block)?.[1];
          if (!ev || data == null) continue;
          const j = JSON.parse(data);
          if (ev === "sources") showSources(j as Source[]);
          else if (ev === "t") text.textContent += (j as { t: string }).t;
        }
      }
    } catch {
      if (mine === ctrl) {
        text.textContent = "I couldn't answer just now. Try again in a moment, or email derek@harvous.com.";
      }
    } finally {
      clearTimeout(timer);
      if (mine === ctrl) root.classList.remove("is-busy");
    }
  });
}

for (const root of document.querySelectorAll<HTMLElement>("[data-ask]")) bind(root);
