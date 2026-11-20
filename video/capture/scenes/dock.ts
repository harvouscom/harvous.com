import type { Scene } from "../scene.ts";

/**
 * The scripture dock, with what lives around it. Tap a pill in a real note
 * and the passage opens on the paper; it holds its place while the note
 * scrolls. From there: cross-references, every note Derek has written on the
 * passage, a dictionary word, and finally "Open in the Bible reader", which
 * grows the card into the reader (the next chapter picks up there).
 *
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
  run: async ({ page, act }) => {
    const card = page.getByRole("region", { name: "Scripture reference editor" }).first();
    await act.pause(700);
    const pill = page.locator(".scripture-pill").first();
    await act.anchor("pill", pill);
    act.mark("pill");
    await act.click(pill, { settle: 1300 });
    act.mark("dock-open");
    await act.anchor("dock", card);
    await act.pause(900);

    // Over the note, above the dock: the page scrolls, the dock holds still.
    await act.rest(720, 260);
    act.mark("scroll");
    await act.scroll(460, { ms: 1500 });
    await act.pause(400);
    act.mark("held");
    await act.anchor("dock-after", card);
    await act.pause(700);

    // Cross-references.
    await act.click(card.getByRole("button", { name: "Show cross-references" }), { settle: 1400 });
    act.mark("xrefs");
    await act.anchor("xrefs", page.getByText("Related passages").first().locator("xpath=.."));
    await act.pause(1300);

    // Every note on this passage.
    await act.click(card.getByRole("button", { name: "Show where this appears in your notes" }), { settle: 1400 });
    act.mark("your-notes");
    await act.anchor("your-notes", page.getByText("Your notes on this passage").first().locator("xpath=.."));
    await act.pause(1500);

    // A dictionary word in the passage: "mercy" if it's in view, else "Moses".
    const words = card.locator(".scripture-pill-chrome__passage-html .reference-suggestion");
    let word = words.filter({ hasText: /^mercy$/i }).first();
    const inView = async () => {
      const box = await word.boundingBox().catch(() => null);
      const cardBox = await card.boundingBox().catch(() => null);
      return !!box && !!cardBox && box.y > cardBox.y && box.y + box.height < cardBox.y + cardBox.height;
    };
    if (!(await inView())) word = words.filter({ hasText: /^Moses$/ }).first();
    await act.anchor("word", word);
    await act.click(word, { settle: 1500 });
    act.mark("dictionary");
    await act.anchor("dictionary", page.getByRole("region", { name: "Reference" }).first());
    await act.pause(2000);

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
