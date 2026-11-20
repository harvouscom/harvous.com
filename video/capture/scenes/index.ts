import type { Scene } from "../scene.ts";
import { dock } from "./dock.ts";
import { home } from "./home.ts";
import { organize } from "./organize.ts";
import { reader } from "./reader.ts";
import { review } from "./review.ts";
import { scripture } from "./scripture.ts";
import { smoke } from "./smoke.ts";
import { threads } from "./threads.ts";

/** In story order: read, write, keep, sort, connect, remember. */
export const SCENES: Scene[] = [home, reader, scripture, dock, organize, threads, review, smoke];
