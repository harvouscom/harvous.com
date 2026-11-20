import type { Scene } from "../scene.ts";

/**
 * Harvous files things for you: the tags it put on a real note, then the
 * topic folders it sorted the Library into. Read-only.
 */
export const organize: Scene = {
  id: "organize",
  devices: ["desktop"],
  start: ({ picks }) => `/${picks.studyNote}`,
  prepare: async ({ page }) => {
    await page.getByRole("button", { name: "Show note details" }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act }) => {
    await act.pause(700);
    await act.click(page.getByRole("button", { name: "Show note details" }), { settle: 1200 });
    const tags = page.getByText("Tags", { exact: true }).locator("xpath=..");
    await act.anchor("tags", tags);
    act.mark("tags");
    await act.hover(tags);
    await act.pause(1500);
    await act.click(page.getByRole("button", { name: "Open search" }), { settle: 900 });
    const library = page.getByRole("region", { name: "Library" });
    await act.click(library.getByRole("button", { name: "Which kind of thing to show" }), { settle: 500 });
    await act.click(page.getByRole("menuitemradio", { name: "Folders" }), { settle: 900 });
    act.mark("folders");
    await act.anchor("folders", library.getByRole("list"));
    await act.pause(1300);
    const exodus = library.getByRole("button", { name: /^Exodus, \d+ notes/ });
    await act.anchor("exodus", exodus);
    await act.click(exodus, { settle: 1200 });
    act.mark("folder-open");
    await act.anchor("folder-notes", library.getByRole("list"));
    await act.pause(1600);
  },
};
