/**
 * The player's settings, in one place because two components now build one.
 *
 * `HeroVideoLightbox` plays a self-hosted mp4 out of R2; `DiscoverVideoEmbed`
 * plays a curated reference from its publisher's YouTube channel. The chrome
 * should be the same object in both — a viewer who watched the tour and then
 * opens a Discover video is looking at the same player — and more importantly
 * the `youtube` block is a privacy promise, not a preference. Left inline in
 * two files, `noCookie` is one careless edit away from being true in one place
 * and false in the other, and nothing would visibly break when it was.
 *
 * Typed loosely on purpose: `plyr` is imported dynamically at the call sites so
 * that a page nobody plays never downloads it, and importing its `Options` type
 * here would pull the module into every page's graph to describe an object
 * literal.
 */
export const PLYR_OPTIONS = {
  controls: [
    "play-large",
    "play",
    "progress",
    "current-time",
    "duration",
    "mute",
    "volume",
    "settings",
    "fullscreen",
  ],
  settings: ["speed"],
  speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
  hideControls: true,
  keyboard: { focused: true, global: false },
  tooltips: { controls: true, seek: true },
  /* youtube-nocookie, and none of YouTube's own chrome competing with Plyr's.
     `rel: 0` keeps the end screen inside the channel rather than offering the
     whole of YouTube, which matters when the video is somebody else's and we
     have promised to send people back to them. */
  youtube: { noCookie: true, rel: 0, modestbranding: 1, iv_load_policy: 3 },
} as const;
