import type { Page } from "playwright";

/**
 * Hide transient UI that would date the video or distract from the scene:
 * the "Harvous was updated" toast, the guest banner, toasts in general.
 * Real study content is never hidden here; that's what scenes.config.ts is for.
 */
const HIDE_CSS = `
  [data-sonner-toaster], [role="region"][aria-label^="Notifications"] { display: none !important; }
  /* Keep the caret from blinking mid-zoom on a parked field. */
  * { caret-color: auto; }
`;

export const tidyPage = async (page: Page) => {
  await page.addStyleTag({ content: HIDE_CSS }).catch(() => {});
  // The update toast is a status region with a Reload button.
  const dismiss = page.getByRole("status").filter({ hasText: "Harvous was updated" }).getByRole("button", { name: "Dismiss" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click().catch(() => {});
  // The phone frame draws the installed app, so the "add to home screen" card goes.
  const install = page.getByText("Add Harvous to your home screen");
  if (await install.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /^Dismiss$/ }).first().click().catch(() => {});
    await page.waitForTimeout(500);
  }
};
