import type { Scene } from "../scene.ts";

/** Review: Harvous brings an old note back. Answers are stubbed by the guard. */
export const review: Scene = {
  id: "review",
  devices: ["desktop"],
  start: () => "/",
  prepare: async ({ page }) => {
    await page.getByRole("tab", { name: "Review" }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act }) => {
    await act.pause(700);
    await act.click(page.getByRole("tab", { name: "Review" }), { settle: 900 });
    const panel = page.getByRole("region", { name: "Review exercises" });
    await act.anchor("review-card", panel);
    act.mark("review-tab");
    await act.pause(1200);
    await act.click(panel.getByRole("button", { name: "Begin" }), { settle: 1500 });
    act.mark("dock");
    const question = page.getByText(/^(Pick|Which|What|Who|Where|Finish)/).first();
    await act.anchor("question", question);
    await act.pause(2200);
    const choices = page.getByRole("button", { name: /^[A-D] / });
    const n = await choices.count();
    for (let i = 0; i < Math.min(n, 3); i++) {
      await act.hover(choices.nth(i));
      await act.pause(650);
    }
    act.mark("choices");
    await act.pause(1200);
    await act.rest();
  },
};
