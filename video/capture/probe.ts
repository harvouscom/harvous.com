/**
 * Print a page's accessibility tree, for writing scene selectors.
 *
 *   npm run intro:probe -- /read/today            # signed in, desktop
 *   npm run intro:probe -- /?try=1 --guest        # fresh guest session
 *   npm run intro:probe -- / --device phone --shot
 */
import { chromium } from "playwright";
import path from "node:path";
import { APP_URL, DEVICES, TAKES_DIR, type Device } from "./config.ts";
import { openProfile } from "./browser.ts";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const value = (name: string) => args[args.indexOf(`--${name}`) + 1];
const target = args.find((a) => a.startsWith("/")) ?? "/";
const device = (flag("device") ? value("device") : "desktop") as Device;

const context = flag("guest")
  ? await (await chromium.launch()).newContext({ ...DEVICES[device] })
  : await openProfile(device, { headless: true });
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(`${APP_URL}${target}`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(Number(flag("wait") ? value("wait") : 2500));

console.log(`# ${page.url()}\n`);
console.log(await page.locator("body").ariaSnapshot());
if (flag("shot")) {
  const file = path.join(TAKES_DIR, `probe-${device}.png`);
  await page.screenshot({ path: file });
  console.log(`\nScreenshot: ${file}`);
}
await context.close();
process.exit(0);
