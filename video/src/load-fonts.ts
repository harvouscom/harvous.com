import { continueRender, delayRender, staticFile } from "remotion";

const FAMILY = "Google Sans";
const FONT_URL = staticFile(
  "fonts/google-sans-flex/GoogleSansFlex-Variable.woff2",
);

let loaded: Promise<void> | null = null;

/**
 * Site product sans (Google Sans Flex), registered as "Google Sans" for labels.
 * Uses woff2-variations like the marketing site — @remotion/fonts' woff2 format hangs on this file.
 */
export const ensureGoogleSans = () => {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }
  if (!loaded) {
    loaded = (async () => {
      const handle = delayRender(`Loading ${FAMILY}`, {
        timeoutInMilliseconds: 120000,
      });
      try {
        const already = Array.from(document.fonts).some(
          (f) => f.family.replace(/["']/g, "") === FAMILY,
        );
        if (!already) {
          const face = new FontFace(
            FAMILY,
            `url('${FONT_URL}') format('woff2-variations')`,
            { weight: "1 1000", style: "normal", display: "block" },
          );
          await face.load();
          document.fonts.add(face);
        }
        await document.fonts.load(`550 26px "${FAMILY}"`);
        continueRender(handle);
      } catch (err) {
        continueRender(handle);
        throw err;
      }
    })();
  }
  return loaded;
};
