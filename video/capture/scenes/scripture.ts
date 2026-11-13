import type { Scene } from "../scene.ts";

let takeStartedAt = 0;

/**
 * Scripture in notes: type a reference and it becomes a pill.
 *
 * This is the one scene that really writes: it creates a throwaway note.
 * Cleanup deletes it, and only it: the newest note with the typed title,
 * created during this take, whose body holds the typed line. Note deletion in
 * Harvous is permanent, so every one of those checks has to pass.
 */
export const scripture: Scene = {
  id: "scripture",
  devices: ["desktop"],
  allow: ["POST /api/notes/create", "PUT /api/notes/update", "POST /api/notes/update"],
  start: () => "/",
  prepare: async ({ page }) => {
    takeStartedAt = Date.now();
    await page.getByRole("button", { name: /^New note/ }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act, picks }) => {
    await act.pause(700);
    await act.click(page.getByRole("button", { name: /^New note/ }), { settle: 1200 });
    act.mark("new-note");
    await act.click(page.getByRole("textbox", { name: "Title" }), { settle: 300 });
    await act.type(picks.typedTitle);
    await act.pause(400);
    const body = page.locator(".tiptap.ProseMirror");
    await act.click(body, { settle: 300 });
    act.mark("typing");
    await act.type(picks.typedLine);
    act.mark("reference");
    await act.type(picks.typedReference);
    await act.type(" ");
    await act.pause(900);
    const pill = body.locator(".scripture-pill").last();
    await pill.waitFor({ timeout: 8000 });
    act.mark("pill");
    await act.anchor("pill", pill);
    await act.pause(1500);
    // A pill opens its passage card on tap once the caret has left it.
    await act.press("Escape");
    await act.click(pill, { settle: 1600 });
    const card = page.getByLabel("Scripture reference");
    if (!(await card.isVisible().catch(() => false))) await act.click(pill, { settle: 1600 });
    act.mark("pill-open");
    await act.anchor("passage-card", page.locator(".study-dock-card").filter({ has: card }).first());
    await act.pause(2400);
    await act.rest();
  },
  cleanup: async ({ page, picks }) => {
    // Let the last autosave land before looking the note up.
    await page.waitForTimeout(2500);
    const result = await page.evaluate(
      async ({ title, line, since }) => {
        const clerk = (window as unknown as { Clerk?: { session?: { getToken(): Promise<string> } } }).Clerk;
        const h = { authorization: `Bearer ${await clerk?.session?.getToken()}` };
        const recent = await (await fetch("/api/notes/recent?limit=10", { headers: h, credentials: "include" })).json();
        const list = (recent.notes ?? recent) as Array<{ id: string; title: string; createdAt: string }>;
        const candidates = list.filter((n) => n.title === title && Date.parse(n.createdAt) >= since - 60_000);
        if (candidates.length !== 1) return `found ${candidates.length} candidates, deleted nothing`;
        const { id } = candidates[0];
        const details = await (await fetch(`/api/notes/${id}/details`, { headers: h, credentials: "include" })).json();
        if (!JSON.stringify(details.note?.content ?? details.content ?? "").includes(line.trim().slice(0, 30))) {
          return `${id} doesn't hold the typed line, deleted nothing`;
        }
        const res = await fetch(`/api/notes/delete?noteId=${encodeURIComponent(id)}`, { method: "DELETE", headers: h, credentials: "include" });
        return res.ok ? `deleted throwaway note ${id}` : `delete of ${id} returned ${res.status}`;
      },
      { title: picks.typedTitle, line: picks.typedLine, since: takeStartedAt },
    );
    console.log(`  cleanup: ${result}`);
    if (!result.startsWith("deleted")) throw new Error(result);
  },
};
