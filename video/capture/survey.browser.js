(async ({ limit, htmlFor }) => {
  for (let i = 0; i < 60 && !window.Clerk?.session; i++) await new Promise((r) => setTimeout(r, 250));
  const clerk = window.Clerk;
  if (!clerk?.session) return `NOT SIGNED IN (${location.href})`;
  const h = { authorization: `Bearer ${await clerk?.session?.getToken()}` };
  const get = async (u) => (await fetch(u, { headers: h, credentials: "include" })).json();
  const contentOf = (d) => String(d.note?.content ?? d.content ?? "");
  if (htmlFor) { const d = await get(`/api/notes/${htmlFor}/details`); return (contentOf(d) || JSON.stringify(d)).slice(0, 5000); }
  const recent = await get(`/api/notes/recent?limit=${limit}`);
  const list = recent.notes ?? recent;
  const rows = [];
  for (const n of list) {
    const html = contentOf(await get(`/api/notes/${n.id}/details`));
    const doc = new DOMParser().parseFromString(html, "text/html");
    const pills = [...doc.querySelectorAll("[data-reference], [data-scripture-reference], .scripture-pill, [data-type*='scripture']")];
    const refs = pills.map((p) => p.getAttribute("data-reference") ?? p.getAttribute("data-scripture-reference") ?? p.textContent ?? "");
    // Old format: a chapter-only chip with the verses trailing as text (":6-7").
    const broken = pills.filter((p) => /^\s*:\s*\d/.test(p.nextSibling?.textContent ?? "")).length;
    const words = (doc.body.textContent ?? "").split(/\s+/).filter(Boolean).length;
    rows.push(`${broken ? "BROKEN" : "clean "} ${String(pills.length).padStart(2)} pills ${String(words).padStart(4)}w  ${n.id}  ${n.title}  | ${refs.slice(0, 6).join(", ")}`);
  }
  return rows.join("\n");
})
