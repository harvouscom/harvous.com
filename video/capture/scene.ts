import type { Page } from "playwright";
import type { Act } from "./act.ts";
import type { Device } from "./config.ts";
import type { Picks } from "./scenes.config.ts";

export type SceneContext = {
  page: Page;
  act: Act;
  device: Device;
  picks: Picks;
  appUrl: string;
};

export type Scene = {
  id: string;
  devices: Device[];
  /** Path to load before recording starts, so the take opens on a settled page. */
  start: (ctx: Omit<SceneContext, "act">) => string;
  /** API writes this scene may really make (see guard.ts). Default: none. */
  allow?: string[];
  /** Runs after load, before recording: wait for content, close stray UI. */
  prepare?: (ctx: Omit<SceneContext, "act">) => Promise<void>;
  run: (ctx: SceneContext) => Promise<void>;
  /** Runs after recording stops, e.g. to trash a throwaway note. */
  cleanup?: (ctx: Omit<SceneContext, "act">) => Promise<void>;
};
