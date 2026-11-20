/**
 * Sign in once, by hand, so captures can run as Derek.
 *
 *   npm run intro:login
 *
 * Opens real Chrome on the persistent capture profile at app.harvous.com.
 * Sign in the normal way, wait for Home to load, then close the window.
 * Nothing here reads or stores a password: the session lives in Chrome's own
 * profile at capture/.profile (gitignored).
 */
import { APP_URL } from "./config.ts";
import { openProfile } from "./browser.ts";

const context = await openProfile("desktop");
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(`${APP_URL}/sign-in`);

console.log(
  "\nSign in to Harvous in the Chrome window that just opened.\n" +
    "When Home has loaded, close the window. The session stays in capture/.profile.\n",
);

await new Promise<void>((resolve) => context.on("close", () => resolve()));
console.log("Saved. Run a capture with: npm run intro:capture -- --scene home --device desktop");
