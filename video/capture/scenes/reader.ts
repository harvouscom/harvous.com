import type { Scene } from "../scene.ts";
import { voice } from "../voice.ts";

/**
 * Bible reader: a chapter Derek has studied, with his notes in the margin.
 * On the desktop it's paced to the narration (capture/voice.ts):
 *   "margin"      rest on the rules beside the verses he's written about
 *   "beside"      a gentle scroll down to the picked verse
 *   "Over time"   tap it, and highlight it by "my own study Bible"
 * Read-only: the guard keeps the highlight on this page only.
 */
export const reader: Scene = {
  id: "reader",
  devices: ["desktop", "phone"],
  start: ({ picks }) => `/read/${picks.readerChapter.book}/${picks.readerChapter.chapter}`,
  prepare: async ({ page }) => {
    await page.getByRole("listbox", { name: /verses$/ }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act, picks, device }) => {
    const verses = page.getByRole("listbox", { name: /verses$/ });
    const paced = device === "desktop";
    const vo = voice(act);
    await act.pause(1000);
    act.mark("chapter");
    await act.anchor("title", page.getByRole("heading", { level: 1 }));
    if (paced) vo.start("reader");
    else await act.pause(1200);

    // "…those same notes sit in the margin…"
    const studied = verses.getByRole("option", { name: /your notes?$/ }).first();
    if (paced) await vo.at("reader", "margin", -0.5);
    await act.hover(studied);
    act.mark("margin");
    await act.anchor("margin", studied);

    // "…beside the verses they're about." A gentle scroll, so the picked verse is in view.
    const verse = verses.getByRole("option").nth(picks.readerVerse - 1);
    if (paced) await vo.at("reader", "beside", -0.2);
    else await act.pause(1800);
    const box = await verse.boundingBox();
    const vh = page.viewportSize()?.height ?? 900;
    if (box && box.y + box.height > vh * 0.62) {
      await act.rest(720, vh * 0.55);
      await act.scroll(Math.round(box.y - vh * 0.42), { ms: 1500 });
    }

    // "Over time, it becomes my own study Bible."
    if (paced) await vo.at("reader", "over", -0.2);
    // A tap anywhere in the verse can land on a dotted dictionary word
    // ("Moses" in Exodus 33:14); the verse number is always the verse itself.
    const number = verse.locator("sup").first();
    await act.click(number, { settle: 300 });
    act.mark("verse-actions");
    const actions = page.getByRole("group", { name: /^Actions for / });
    await act.anchor("verse-actions", actions);
    if (paced) await vo.at("reader", "own", -0.5);
    else await act.pause(900);
    // Highlight paints amber straight away; the picker that opens offers other colours.
    await act.click(actions.getByRole("button", { name: /^Highlight / }), { settle: 900 });
    // Close the colour picker by tapping the verse again (Escape leaves a focus ring).
    await act.click(number, { settle: 500 });
    act.mark("highlighted");
    await act.anchor("highlighted", verse);
    if (paced) await act.waitUntil(vo.end("reader", 1.0));
    else await act.pause(1600);
    act.mark("done");
    await act.rest();
  },
};
