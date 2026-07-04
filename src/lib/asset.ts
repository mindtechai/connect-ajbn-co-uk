/**
 * Asset URL helper.
 *
 * Binary assets (images/fonts/etc.) are stored as `.asset.json` pointer files
 * whose `url` field is a root-relative path like `/__l5e/assets-v1/<id>/<name>`.
 * That path is served by Lovable's edge in production and by the Vite dev
 * proxy in local development.
 *
 * If `VITE_ASSET_BASE_URL` is set (e.g. a dedicated CDN or the published
 * Lovable domain), it is prefixed to every asset URL. Otherwise assets resolve
 * same-origin, which is the default and works everywhere.
 */

export interface AssetPointer {
  url: string;
  content_type?: string;
  original_filename?: string;
  [key: string]: unknown;
}

const RAW_BASE = (import.meta.env.VITE_ASSET_BASE_URL ?? "").trim();
// Strip trailing slash so we can safely concatenate with the leading-slash `url`.
export const ASSET_BASE_URL = RAW_BASE.replace(/\/+$/, "");

/**
 * Resolve a `.asset.json` pointer (or raw path string) to a fully-qualified
 * URL suitable for `<img src>`, `background-image`, `fetch()`, etc.
 */
export function assetUrl(pointer: AssetPointer | string): string {
  const path = typeof pointer === "string" ? pointer : pointer.url;
  if (!path) return "";
  // Absolute URLs pass through unchanged.
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) return path;
  if (!ASSET_BASE_URL) return path;
  return `${ASSET_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}