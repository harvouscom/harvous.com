import type { Scene } from "../scene.ts";
import { voice } from "../voice.ts";

/**
 * Harvous files things for you: the tags it put on a real note, then the
 * topic folders it sorted the Library into. Paced to the narration
 * (capture/voice.ts): the tags on "tags", the folders on "folders", one
 * opened on "own". Read-only.
 */
export const organize: Scene = {
  id: "organize",
  devices: ["desktop"],
  start: ({ picks }) => `/${picks.studyNote}`,
  prepare: async ({ page }) => {
    await page.getByRole("button", { name: "Show note details" }).waitFor({ timeout: 20000 });
    // Start with no cards open (the dock scene leaves a dictionary card on this note).
    for (let i = 0; i < 4; i++) {
      const dismiss = page.getByRole("region", { name: "Study docks" }).getByRole("button", { name: "Dismiss" }).first();
      if (!(await dismiss.isVisible().catch(() => false))) break;
      await dismiss.click();
      await page.waitForTimeout(500);
    }
  },
  run: async ({ page, act, picks }) => {
    const vo = voice(act);
    const details = page.getByRole("button", { name: "Show note details" });
    await act.hover(details);
    await act.pause(1200);

    // "I never have to file anything. Harvous tags my notes…"
    vo.start("organize");
    await vo.at("organize", "tags", -0.7);
    await act.click(details, { settle: 300 });
    const tags = page.getByText("Tags", { exact: true }).locator("xpath=..");
    await act.anchor("tags", tags);
    act.mark("tags");

    // "…and sorts them into folders…": the Library opens beside the tags (it
    // always opens on Everything), and Folders is picked as it's said.
    await act.click(page.getByRole("button", { name: "Open search" }), { settle: 300 });
    const library = page.getByRole("region", { name: "Library" });
    await act.click(library.getByRole("button", { name: "Which kind of thing to show" }), { settle: 200 });
    const folders = page.getByRole("menuitemradio", { name: "Folders" });
    await act.hover(folders);
    await vo.at("organize", "folders", -0.5);
    await act.click(folders, { settle: 200 });
    act.mark("folders");
    await act.anchor("folders", library.getByRole("list"));

    // "…on its own."
    const folder = library.getByRole("button", { name: new RegExp(`^${picks.folderName}, \\d+ notes`) });
    await act.anchor("exodus", folder);
    await act.hover(folder);
    await vo.at("organize", "own", -0.3);
    await act.click(folder, { settle: 300 });
    act.mark("folder-open");
    await act.anchor("folder-notes", library.getByRole("list"));
    await act.waitUntil(vo.end("organize", 1.0));
    act.mark("done");
    await act.rest();
  },
};
