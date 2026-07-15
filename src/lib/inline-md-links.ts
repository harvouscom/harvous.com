/** Escape HTML, then turn `[label](href)` into safe anchors for controlled marketing copy. */
export function inlineMdLinksToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return escaped.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      const safeHref = href.replace(/"/g, "");
      if (!/^(https?:\/\/|\/|mailto:)/.test(safeHref)) return label;
      return `<a href="${safeHref}">${label}</a>`;
    }
  );
}
