import { continueRender, delayRender, staticFile } from "remotion";

/**
 * The site's own type: Google Sans Flex for everything, Caveat for the
 * one-line handwritten notes (BRAND_KIT.md). Copied in by `npm run intro:prep`.
 */
const FACES = [
  { family: "Google Sans", file: "intro/assets/GoogleSansFlex-Variable.woff2", weight: "1 1000" },
  { family: "Caveat", file: "intro/assets/Caveat-Latin.woff2", weight: "400 700" },
];

let loading: Promise<void> | null = null;

export const loadIntroFonts = () => {
  if (typeof document === "undefined") return Promise.resolve();
  if (!loading) {
    const handle = delayRender("Loading intro fonts", { timeoutInMilliseconds: 60000 });
    loading = Promise.all(
      FACES.map(async (f) => {
        // woff2-variations, like the site: @remotion/fonts' plain woff2 hangs on this file.
        const face = new FontFace(f.family, `url('${staticFile(f.file)}') format('woff2-variations')`, {
          weight: f.weight,
          display: "block",
        });
        await face.load();
        document.fonts.add(face);
      }),
    )
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }
  return loading;
};
