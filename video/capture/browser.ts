import { chromium, type BrowserContext } from "playwright";
import { DEVICES, PROFILE_DIR, type Device } from "./config.ts";

/**
 * Opens Derek's persistent Chrome profile. Real Chrome (not Playwright's
 * Chromium) keeps the sign-in looking like an ordinary browser to Cloudflare
 * and Clerk.
 */
export const openProfile = async (
  device: Device,
  { headless = false }: { headless?: boolean } = {},
): Promise<BrowserContext> => {
  const d = DEVICES[device];
  return chromium.launchPersistentContext(PROFILE_DIR, {
    channel: "chrome",
    headless,
    viewport: d.viewport,
    deviceScaleFactor: d.deviceScaleFactor,
    isMobile: d.isMobile,
    hasTouch: d.hasTouch,
    userAgent: d.userAgent,
    colorScheme: "light",
    reducedMotion: "no-preference",
    locale: "en-US",
    timezoneId: "America/New_York",
    args: ["--hide-scrollbars", "--disable-features=Translate"],
    ignoreDefaultArgs: ["--enable-automation"],
  });
};
