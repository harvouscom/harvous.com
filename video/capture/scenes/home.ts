import type { Scene } from "../scene.ts";

/** Home + Today's passage: where each day starts. */
export const home: Scene = {
  id: "home",
  devices: ["desktop", "phone"],
  start: () => "/",
  prepare: async ({ page }) => {
    await page.getByRole("region", { name: "Today’s passage" }).waitFor({ timeout: 20000 });
  },
  run: async ({ page, act, device }) => {
    const passage = page.getByRole("region", { name: "Today’s passage" });
    await act.pause(900);
    act.mark("greeting");
    await act.anchor("greeting", page.locator("main article p").first());
    await act.pause(1400);
    await act.hover(passage.locator("p").first());
    act.mark("passage");
    await act.anchor("passage", passage);
    await act.pause(2200);
    if (device === "phone") await act.scroll(320, { ms: 1100 });
    const pickUpTab = page.getByRole("tab", { name: "Pick up" });
    if ((await pickUpTab.getAttribute("aria-selected")) !== "true") await act.click(pickUpTab, { settle: 700 });
    const pickUp = page.getByRole("region", { name: "Pick up" });
    await act.hover(pickUp.getByRole("button").first());
    act.mark("pick-up");
    await act.anchor("pick-up", pickUp);
    await act.pause(1800);
    await act.scroll(device === "phone" ? 420 : 360, { ms: 1300 });
    const myBible = page.getByRole("button", { name: /^My Bible/ });
    await act.hover(myBible);
    act.mark("my-bible");
    await act.anchor("my-bible", myBible);
    await act.pause(2000);
    await act.rest();
  },
};
