/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL prefixed to asset pointer paths (`/__l5e/assets-v1/...`).
   * Leave empty for same-origin (default). Example:
   *   VITE_ASSET_BASE_URL=https://impact-connect-guild.lovable.app
   */
  readonly VITE_ASSET_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
