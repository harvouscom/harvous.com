import type { Scene } from "../scene.ts";

/**
 * A guest-mode take that needs no sign-in, used to check the recorder:
 * the Library panel morph and a reader scroll are the hardest motion we film.
 *
 *   npm run intro:capture -- --scene smoke --device desktop --guest
 */
export const smoke: Scene = {
  id: "smoke",
  devices: ["desktop", "phone"],
  start: () => "/?try=1",
  run: async ({ page, act }) => {
    await act.pause(600);
    await act.click(page.getByRole("button", { name: "Open search" }), { settle: 1200 });
    act.mark("library-open");
    await act.press("Escape");
    await act.pause(900);
    await act.click(page.getByRole("button", { name: "Open today’s passage" }), { settle: 1800 });
    act.mark("reader-open");
    await act.scroll(700, { ms: 1400 });
    await act.pause(800);
    await act.scroll(-300, { ms: 900 });
    await act.pause(600);
    await act.rest();
  },
};
