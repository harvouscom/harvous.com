/** True when every slide is visible inside the track without horizontal scroll. */
export function carouselFitsAll(track: HTMLElement, slideSelector: string): boolean {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 2) return true;

  const slides = track.querySelectorAll<HTMLElement>(slideSelector);
  if (!slides.length) return true;

  const trackRect = track.getBoundingClientRect();
  const first = slides[0].getBoundingClientRect();
  const last = slides[slides.length - 1].getBoundingClientRect();

  return first.left >= trackRect.left - 1 && last.right <= trackRect.right + 1;
}

type BindCarouselFitOptions = {
  /** Unused by the implementation; optional so callers aren't forced to invent one. */
  fitRoots?: HTMLElement[];
  track: HTMLElement;
  slideSelector: string;
  controlRoots?: HTMLElement[];
  prevBtn?: HTMLButtonElement | null;
  nextBtn?: HTMLButtonElement | null;
  /** When false, the slider is treated as a static grid — scrolling/arrows are skipped. */
  enabled?: () => boolean;
};

function trackPadStart(track: HTMLElement): number {
  const style = getComputedStyle(track);
  return parseFloat(style.scrollPaddingLeft || style.paddingLeft || "0") || 0;
}

function nearestSlideIndex(track: HTMLElement, slides: HTMLElement[]): number {
  const pad = trackPadStart(track);
  const current = track.scrollLeft;
  let index = 0;
  let best = Infinity;
  slides.forEach((slide, i) => {
    const pos = slide.offsetLeft - pad;
    const dist = Math.abs(pos - current);
    if (dist < best) {
      best = dist;
      index = i;
    }
  });
  return index;
}

/** Keep prev/next disabled state in sync with scroll position. */
export function bindCarouselFit({
  track,
  slideSelector,
  prevBtn,
  nextBtn,
  enabled,
}: BindCarouselFitOptions): void {
  if (track.dataset.carouselBound === "1") return;
  track.dataset.carouselBound = "1";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slidesOf = () => [...track.querySelectorAll<HTMLElement>(slideSelector)];

  const update = () => {
    if (enabled && !enabled()) return;

    if (carouselFitsAll(track, slideSelector)) {
      if (track.scrollLeft > 1) track.scrollLeft = 0;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const max = Math.max(0, track.scrollWidth - track.clientWidth - 1);
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= max;
  };

  const scrollByDir = (dir: 1 | -1) => {
    if (enabled && !enabled()) return;
    if (carouselFitsAll(track, slideSelector)) return;

    const slides = slidesOf();
    if (!slides.length) return;

    const pad = trackPadStart(track);
    const index = nearestSlideIndex(track, slides);
    const next = slides[index + dir];
    if (!next) {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      track.scrollTo({
        left: dir > 0 ? max : 0,
        behavior: reduced ? "auto" : "smooth",
      });
      return;
    }

    track.scrollTo({
      left: Math.max(0, next.offsetLeft - pad),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  prevBtn?.addEventListener("click", () => scrollByDir(-1));
  nextBtn?.addEventListener("click", () => scrollByDir(1));

  let ticking = false;
  track.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );

  track.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", update, { once: true });
    img.addEventListener("error", update, { once: true });
  });

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    for (const slide of track.querySelectorAll<HTMLElement>(slideSelector)) {
      resizeObserver.observe(slide);
    }
  }

  window.addEventListener("resize", update, { passive: true });
  if (typeof window.matchMedia === "function") {
    window.matchMedia("(max-width: 719px)").addEventListener("change", update);
  }

  requestAnimationFrame(update);
  window.addEventListener("load", update, { once: true });
}
