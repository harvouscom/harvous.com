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

export const CAROUSEL_FIT_CLASS = "is-fits-all";
export const CAROUSEL_CONTROLS_HIDDEN_CLASS = "carousel-controls--hidden";

type BindCarouselFitOptions = {
  fitRoots: HTMLElement[];
  track: HTMLElement;
  slideSelector: string;
  controlRoots?: HTMLElement[];
  prevBtn?: HTMLButtonElement | null;
  nextBtn?: HTMLButtonElement | null;
  /** When false, fit layout is cleared (e.g. bento desktop grid). */
  enabled?: () => boolean;
};

/** Toggle fit layout, hide nav, and keep arrow disabled state in sync. */
export function bindCarouselFit({
  fitRoots,
  track,
  slideSelector,
  controlRoots = [],
  prevBtn,
  nextBtn,
  enabled,
}: BindCarouselFitOptions): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const step = () => {
    const slide = track.querySelector<HTMLElement>(slideSelector);
    if (!slide) return track.clientWidth * 0.9;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
    return slide.getBoundingClientRect().width + gap;
  };

  const setControlsHidden = (hidden: boolean) => {
    for (const el of controlRoots) {
      el.classList.toggle(CAROUSEL_CONTROLS_HIDDEN_CLASS, hidden);
    }
  };

  const update = () => {
    if (enabled && !enabled()) {
      for (const root of fitRoots) {
        root.classList.remove(CAROUSEL_FIT_CLASS);
      }
      setControlsHidden(false);
      return;
    }

    const fitsAll = carouselFitsAll(track, slideSelector);
    for (const root of fitRoots) {
      root.classList.toggle(CAROUSEL_FIT_CLASS, fitsAll);
    }
    setControlsHidden(fitsAll);

    if (fitsAll) {
      track.scrollLeft = 0;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const max = track.scrollWidth - track.clientWidth - 1;
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 0;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= max;
  };

  const scrollByDir = (dir: 1 | -1) => {
    if (carouselFitsAll(track, slideSelector)) return;
    track.scrollBy({ left: dir * step(), behavior: reduced ? "auto" : "smooth" });
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
