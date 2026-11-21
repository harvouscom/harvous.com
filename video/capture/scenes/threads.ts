import type { Scene } from "../scene.ts";
import { voice } from "../voice.ts";

/**
 * Threads: study connected over time. Paced to the narration (capture/voice.ts),
 * so the footage plays at its own speed under the voice:
 *   before the line   the Library, filtered to Threads (stray notes stay off screen)
 *   "theme"           open the Holy Spirit thread
 *   "weeks of study"  read down its notes
 *   "share"           the Share Thread button
 *   after the line    into a note, and its details
 *   "threads-walk"    starts as the note's Thread section comes into view;
 *                     the pointer runs down what it links to, without leaving.
 * Read-only: the guard stubs every write.
 */
export const threads: Scene = {
  id: "threads",
  devices: ["desktop"],
  start: () => "/",
  prepare: async ({ page }) => {
    await page.getByRole("button", { name: "Open search" }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act, picks }) => {
    const vo = voice(act);
    await act.pause(600);
    await act.click(page.getByRole("button", { name: "Open search" }), { settle: 800 });
    const library = page.getByRole("region", { name: "Library" });
    await act.click(library.getByRole("button", { name: "Which kind of thing to show" }), { settle: 450 });
    await act.click(page.getByRole("menuitemradio", { name: "Threads" }), { settle: 900 });
    act.mark("threads");
    const thread = picks.threadTitle
      ? library.getByRole("button", { name: new RegExp(`^${picks.threadTitle}`) })
      : library.getByRole("listitem").first().getByRole("button").first();
    await act.anchor("thread", thread);
    await act.hover(thread);
    await act.pause(1400);

    // "And threads are mine. I pull one theme together…"
    vo.start("threads");
    await vo.at("threads", "theme", -0.5);
    await act.click(thread, { settle: 300 });
    act.mark("thread-open");
    await act.anchor("thread-notes", library.getByRole("list"));
    // "…across weeks of study, like everything I've been learning about the Holy Spirit."
    const notes = library.getByRole("listitem");
    await vo.at("threads", "weeks", -0.2);
    for (const i of [1, 3, 5]) {
      await act.hover(notes.nth(i).getByRole("button").first());
      await act.pause(500);
    }
    // "I can share the whole thread with a link."
    const share = library.getByRole("button", { name: /Share Thread/ });
    await vo.at("threads", "share", -0.9);
    await act.hover(share);
    act.mark("share");
    await act.anchor("share", share);
    await act.waitUntil(vo.end("threads", 0.15));

    // Into one of its notes; the second line starts as it opens.
    await act.click(notes.first().getByRole("button").first(), { settle: 500 });
    act.mark("note-open");
    // "And each note links to the others, so I can walk the whole line of thinking."
    vo.start("threads-walk", "walk");
    await act.click(page.getByRole("button", { name: "Show note details" }), { settle: 600 });
    await act.rest(1300, 560);
    await act.scroll(360, { ms: 900 });
    const linkedFrom = page.getByText(/^Linked from$/i).first();
    await act.anchor("thread-links", linkedFrom.locator("xpath=../.."));
    act.mark("links");

    const links = linkedFrom.locator("xpath=../..").locator("button, a");
    await act.hover(links.first());
    await vo.at("threads-walk", "walk", -0.4);
    for (const i of [2, 3, 4]) {
      await act.hover(links.nth(i));
      await act.pause(420);
    }
    await act.waitUntil(vo.end("threads-walk", 0.4));
    act.mark("done");
    await act.rest();
  },
};
