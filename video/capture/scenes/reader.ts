import type { Scene } from "../scene.ts";

/** Bible reader: a chapter Derek has studied, with his notes in the margin. */
export const reader: Scene = {
  id: "reader",
  devices: ["desktop", "phone"],
  start: ({ picks }) => `/read/${picks.readerChapter.book}/${picks.readerChapter.chapter}`,
  prepare: async ({ page }) => {
    await page.getByRole("listbox", { name: /verses$/ }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act, picks, device }) => {
    const verses = page.getByRole("listbox", { name: /verses$/ });
    await act.pause(1000);
    act.mark("chapter");
    await act.anchor("title", page.getByRole("heading", { level: 1 }));
    await act.pause(1200);
    // The margin rules beside the verses Derek has written about.
    const studied = verses.getByRole("option", { name: /your notes?$/ }).first();
    await act.hover(studied);
    act.mark("margin");
    await act.anchor("margin", studied);
    await act.pause(1800);
    const verse = verses.getByRole("option").nth(picks.readerVerse - 1);
    // On the phone a tap anywhere in the verse can land on a dotted dictionary
    // word; the verse number is always the verse itself.
    await act.click(device === "phone" ? verse.locator("sup").first() : verse, { settle: 900 });
    act.mark("verse-actions");
    const actions = page.getByRole("group", { name: /^Actions for / });
    await act.anchor("verse-actions", actions);
    await act.pause(900);
    // Highlight paints amber straight away; the picker that opens offers other colours.
    await act.click(actions.getByRole("button", { name: /^Highlight / }), { settle: 1100 });
    // Close the colour picker by tapping the verse again (Escape leaves a focus ring).
    await act.click(device === "phone" ? verse.locator("sup").first() : verse, { settle: 700 });
    act.mark("highlighted");
    await act.anchor("highlighted", verse);
    await act.pause(1600);
    await act.scroll(260, { ms: 1200 });
    await act.pause(800);
    await act.rest();
  },
};
