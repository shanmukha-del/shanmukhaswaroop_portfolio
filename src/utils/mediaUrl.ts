/**
 * Resolves media asset paths reliably across dev server, preview, and file:/// protocol.
 */
export function resolveMediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, '').replace(/^\.\//, '');
  if (typeof window !== 'undefined') {
    // Under file:/// protocol (e.g. testing dist builds directly), relative ./ paths
    // bypass Chromium local origin restrictions and decode immediately
    if (window.location.protocol === 'file:') {
      return `./${clean}`;
    }
    const base = document.baseURI || window.location.href;
    try {
      return new URL(clean, base).href;
    } catch {
      return `./${clean}`;
    }
  }
  return `./${clean}`;
}
