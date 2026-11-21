import type { Scene } from "../scene.ts";
import { voice } from "../voice.ts";

/**
 * The scripture dock, with what lives around it, paced to the narration
 * (capture/voice.ts) so the footage plays at its own speed under the voice:
 *   "reference"          tap a pill in a real note; the passage opens on the page
 *   "stays put … scroll" the note scrolls, the dock holds still
 *   "Cross-references"   Related passages
 *   "every note"         every note Derek has written on the passage
 *   "word catches me"    a dotted dictionary word, then its entry
 *   after the line       "Open in the Bible reader" grows the card into the
 *                        reader (the next chapter picks up there)
 * Read-only: the guard stubs every write.
 */
export const dock: Scene = {
  id: "dock",
  devices: ["desktop"],
  start: ({ picks }) => `/${picks.studyNote}`,
  prepare: async ({ page }) => {
    await page.locator(".scripture-pill").first().waitFor({ timeout: 20000 });
    // Start with no cards open, whatever the note last remembered.
    for (let i = 0; i < 4; i++) {
      const dismiss = page.getByRole("region", { name: "Study docks" }).getByRole("button", { name: "Dismiss" }).first();
      if (!(await dismiss.isVisible().catch(() => false))) break;
      await dismiss.click();
      await page.waitForTimeout(500);
    }
  },
  run: async ({ page, act, picks }) => {
    const vo = voice(act);
    const card = page.getByRole("region", { name: "Scripture reference editor" }).first();
    const pill = page.locator(".scripture-pill").first();
    await act.anchor("pill", pill);
    await act.hover(pill);
    await act.pause(900);

    // "Tap a reference, and the passage opens right on the page…"
    vo.start("dock");
    await vo.at("dock", "reference", -0.2);
    act.mark("pill");
    await act.click(pill, { settle: 200 });
    act.mark("dock-open");
    await act.anchor("dock", card);

    // "…and stays put as I scroll."
    await act.rest(720, 260);
    await vo.at("dock", "stays", -0.1);
    act.mark("scroll");
    await act.scroll(420, { ms: 1700 });
    act.mark("held");
    await act.anchor("dock-after", card);

    // "Cross-references are a tap away."
    const xrefs = card.getByRole("button", { name: "Show cross-references" });
    await act.hover(xrefs);
    await vo.at("dock", "cross", -0.5);
    await act.click(xrefs, { settle: 200 });
    act.mark("xrefs");
    await act.anchor("xrefs", page.getByText("Related passages").first().locator("xpath=.."));

    // "So is every note I've written on it."
    const yours = card.getByRole("button", { name: "Show where this appears in your notes" });
    await act.hover(yours);
    await vo.at("dock", "every", -0.5);
    await act.click(yours, { settle: 200 });
    act.mark("your-notes");
    await act.anchor("your-notes", page.getByText("Your notes on this passage").first().locator("xpath=.."));

    // "And if a word catches me, the dictionary's right there."
    const words = card.locator(".scripture-pill-chrome__passage-html .reference-suggestion");
    const word = picks.dictionaryWord ? words.filter({ hasText: new RegExp(`^${picks.dictionaryWord}$`, "i") }).first() : words.first();
    await vo.at("dock", "word", -0.2);
    await act.anchor("word", word);
    await act.hover(word);
    await vo.at("dock", "dictionary", -0.6);
    await act.click(word, { settle: 200 });
    act.mark("dictionary");
    await act.anchor("dictionary", page.getByRole("region", { name: "Reference" }).first());
    await act.waitUntil(vo.end("dock", 0.9));

    // Back to the passage, then into the reader.
    const scriptureItem = page.getByRole("listitem", { name: /^Scripture / }).first();
    await act.click(scriptureItem, { settle: 900 });
    const open = page.getByRole("button", { name: "Open in the Bible reader" }).first();
    await act.anchor("open-reader-btn", open);
    await act.click(open, { settle: 2000 });
    act.mark("open-reader");
    await act.pause(1500);
  },
};
