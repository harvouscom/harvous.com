/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
// The source footage lives here, not in the site's public/ — it is a render
// input, not a site asset, and at 371 MB it exceeds Cloudflare's 25 MiB
// per-asset limit. staticFile() resolves against this directory.
Config.setPublicDir(path.join(process.cwd(), "footage"));
