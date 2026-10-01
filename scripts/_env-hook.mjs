/**
 * Node loader hook: lets scripts import src/lib/*.ts data modules that read
 * Astro's `import.meta.env` (undefined outside Vite) by substituting an empty
 * env object. Used by generate-og-cards.mjs; nothing else depends on it.
 */
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes("/src/") && result.source) {
    const source = String(result.source).replaceAll("import.meta.env", "({})");
    return { ...result, source };
  }
  return result;
}
