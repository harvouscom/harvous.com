/** Derive a sibling WebP path for a PNG/JPEG public asset. */
export function webpSrc(src: string): string {
  return src.replace(/\.(png|jpe?g)$/i, ".webp");
}

export function isRasterPublicImage(src: string): boolean {
  return /^\/[^?]+\.(png|jpe?g)$/i.test(src);
}
