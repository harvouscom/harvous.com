import type { Scene } from "../scene.ts";

/**
 * Threads: study connected over time. Open a thread from the Library (filtered
 * to Threads, so stray notes stay off screen), see its notes and its share
 * button, open one, and follow its thread link to the note before it.
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
    await act.pause(600);
    await act.click(page.getByRole("button", { name: "Open search" }), { settle: 800 });
    const library = page.getByRole("region", { name: "Library" });
    await act.click(library.getByRole("button", { name: "Which kind of thing to show" }), { settle: 450 });
    await act.click(page.getByRole("menuitemradio", { name: "Threads" }), { settle: 800 });
    act.mark("threads");
    const thread = picks.threadTitle
      ? library.getByRole("button", { name: new RegExp(`^${picks.threadTitle}`) })
      : library.getByRole("listitem").first().getByRole("button").first();
    await act.anchor("thread", thread);
    await act.pause(700);
    await act.click(thread, { settle: 1100 });
    act.mark("thread-open");
    await act.anchor("thread-notes", library.getByRole("list"));
    await act.pause(900);
    const share = library.getByRole("button", { name: /Share Thread/ });
    await act.hover(share);
    act.mark("share");
    await act.anchor("share", share);
    await act.pause(1300);

    // Into one of its notes, then along the thread to the note before it.
    const first = library.getByRole("listitem").first().getByRole("button").first();
    await act.click(first, { settle: 1600 });
    act.mark("note-open");
    await act.pause(700);
    await act.click(page.getByRole("button", { name: "Show note details" }), { settle: 1100 });
    // The Thread section sits at the foot of the details pane: scroll it into view.
    await act.rest(1300, 560);
    await act.scroll(360, { ms: 1100 });
    await act.pause(300);
    const linkedFrom = page.getByText(/^Linked from$/i).first();
    const threadSection = linkedFrom.locator("xpath=../..");
    await act.anchor("thread-links", threadSection);
    act.mark("links");
    await act.pause(1500);
    // The note this one is linked from: the first link after "Linked from".
    const linked = linkedFrom.locator("xpath=following::*[self::button or self::a][1]");
    await act.anchor("linked", linked);
    await act.click(linked, { settle: 1600 });
    act.mark("walked");
    await act.pause(1400);
    await act.rest();
  },
};
