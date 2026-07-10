Execute the three requested SEO/PWA metadata updates only. No sitemap will be generated.

1. Create `public/manifest.webmanifest`
   - Add basic PWA metadata: `name`, `short_name`, `description`, `start_url`, `scope`, `display`, `background_color`, `theme_color`, `orientation`.
   - Point icons to the existing `/favicon.ico` so the manifest is valid without introducing new assets.
   - Use AJBN brand colors (navy `#174164` for theme/background) and a safe description.

2. Update `index.html`
   - Keep the existing `title`, `description`, `canonical`, `og:*`, and `twitter:*` tags.
   - Add PWA install tags: `<link rel="manifest" href="/manifest.webmanifest" />`, `<meta name="theme-color" content="#174164" />`, `<meta name="apple-mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`, `<meta name="apple-mobile-web-app-title" content="AJBN Connect" />`, and `<link rel="apple-touch-icon" href="/favicon.ico" />`.
   - Add Organization JSON-LD script block linking the portal to the Asian Jewish Business Network brand: `@type: Organization`, `name`, `url`, `sameAs` (placeholder for LinkedIn/website if known), and `description`.

3. Update `public/robots.txt`
   - Keep the existing `User-agent` blocks for Googlebot, Bingbot, Twitterbot, and facebookexternalhit.
   - Change the wildcard `User-agent: *` block to allow public landing pages and explicitly disallow private routes behind authentication.
   - Disallow: `/dashboard`, `/settings/`, `/directory`, `/messages`, `/events`, `/esg`, `/lions/apply`, `/admin`, `/unsubscribe`, `/email-unsubscribe`, `/reset-password`, `/forgot-password`, `/tickets/flagship`, `/buy`, `/buy/`, and any path starting with `/lovable/` or `__l5e`.
   - Add a `Sitemap: https://connect.ajbn.co.uk/sitemap.xml` directive only if the user explicitly asks; in this plan, omit it to match the request.

4. Verify
   - Run a build or typecheck to ensure the static files are syntactically valid and the project still compiles.
   - No new runtime dependencies or backend changes.