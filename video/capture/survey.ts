/**
 * Read-only: list Derek's recent notes with their scripture pills, flagging
 * old-format pills (a chapter-only chip with the verses trailing as plain
 * text, e.g. "Exodus 34" then ":6-7"), so a scene can pick a note that
 * renders cleanly. Only GETs; nothing is written.
 *
 *   npx tsx capture/survey.ts [limit] [--html <noteId>]
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { APP_URL } from "./config.ts";
import { openProfile } from "./browser.ts";

const args = process.argv.slice(2);
const limit = Number(args.find((a) => /^\d+$/.test(a)) ?? 60);
const htmlFor = args.includes("--html") ? args[args.indexOf("--html") + 1] : null;

const context = await openProfile("desktop", { headless: true });
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(`${APP_URL}/`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(2500);
// The page code lives in a plain .js file: tsx's name helpers don't exist in the page.
const code = readFileSync(path.join(import.meta.dirname, "survey.browser.js"), "utf8");
const out = await page.evaluate(`(${code.trim().replace(/;$/, "")})(${JSON.stringify({ limit, htmlFor })})`);
console.log(out);
await context.close();
process.exit(0);
