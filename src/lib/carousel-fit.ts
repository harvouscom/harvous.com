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

function maxScrollLeft(track: HTMLElement): number {
  return Math.max(0, track.scrollWidth - track.clientWidth);
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
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const max = maxScrollLeft(track);
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 1;
  };

  const scrollToLeft = (left: number) => {
    const max = maxScrollLeft(track);
    track.scrollTo({
      left: Math.min(max, Math.max(0, left)),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const scrollByDir = (dir: 1 | -1) => {
    if (enabled && !enabled()) return;
    if (carouselFitsAll(track, slideSelector)) return;

    const slides = slidesOf();
    if (!slides.length) return;

    const pad = trackPadStart(track);
    const max = maxScrollLeft(track);
    const index = nearestSlideIndex(track, slides);
    const next = slides[index + dir];

    if (!next) {
      scrollToLeft(dir > 0 ? max : 0);
      return;
    }

    const target = next.offsetLeft - pad;
    // Last leftover step on a short lane: go to the end instead of a snap
    // point the track cannot actually reach.
    if (dir > 0 && target > max - 8) {
      scrollToLeft(max);
      return;
    }
    if (dir < 0 && target < 8) {
      scrollToLeft(0);
      return;
    }
    scrollToLeft(target);
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
