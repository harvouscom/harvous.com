/**
 * Copy-to-clipboard button behavior shared by SupportContactCards (the support
 * email) and the homepage FAQ (per-question links): a transient `.is-copied`
 * state, a swapped label + aria-label, and a guard against binding twice.
 */
type CopyButtonState = { label?: string; ariaLabel: string };

interface CopyButtonOptions {
  /** Resting label + aria-label, restored after the copied/failed state. */
  idle: CopyButtonState;
  done: CopyButtonState;
  failed: CopyButtonState;
  /** Element inside the button whose text is the visible label. */
  labelSelector?: string;
  /** Runs when the clipboard can't be written, before the failed state shows. */
  onFail?: (text: string) => void;
  resetMs?: number;
}

export function bindCopyButton(
  button: HTMLButtonElement,
  getText: () => string | undefined,
  options: CopyButtonOptions
): void {
  if (button.dataset.copyBound === "true") return;
  button.dataset.copyBound = "true";

  const label = options.labelSelector ? button.querySelector(options.labelSelector) : null;
  let resetTimer = 0;

  const show = (state: CopyButtonState) => {
    button.setAttribute("aria-label", state.ariaLabel);
    if (label && state.label) label.textContent = state.label;
  };

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const text = getText();
    if (!text) return;
    window.clearTimeout(resetTimer);

    try {
      await navigator.clipboard.writeText(text);
      button.classList.add("is-copied");
      show(options.done);
    } catch {
      options.onFail?.(text);
      show(options.failed);
    }

    resetTimer = window.setTimeout(() => {
      button.classList.remove("is-copied");
      show(options.idle);
    }, options.resetMs ?? 2000);
  });
}
