/**
 * Standardize strings to create safe HTML IDs and URL anchors.
 * This function is shared between the Vue components (runtime) and the VitePress sidebar generator (build time).
 */
export function slugify(text: string): string {
  if (!text) return ''
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5\-]/g, '')
}
