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
  fitRoots: HTMLElement[];
  track: HTMLElement;
  slideSelector: string;
  controlRoots?: HTMLElement[];
  prevBtn?: HTMLButtonElement | null;
  nextBtn?: HTMLButtonElement | null;
};

/** Keep prev/next disabled state in sync with scroll position. */
export function bindCarouselFit({
  track,
  slideSelector,
  prevBtn,
  nextBtn,
}: BindCarouselFitOptions): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const step = () => {
    const slide = track.querySelector<HTMLElement>(slideSelector);
    if (!slide) return track.clientWidth * 0.9;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
    return slide.getBoundingClientRect().width + gap;
  };

  const update = () => {
    if (carouselFitsAll(track, slideSelector)) {
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
