// The site's identity, written once. The header, the home page's heading, the
// page titles and the Open Graph card read SITE_NAME; the footer and the
// banner on a post link to SOURCE_URL. A product built from this baseline gets
// both rewritten to its own name and repository at instantiation, so keep
// them literal and on one line each.
export const SITE_NAME = "My Blog";
export const SOURCE_URL = "https://github.com/sourceplane/blog-starter";

// The site's public origin, which makes the posts' Open Graph images absolute.
// The deploy sets it per environment (apps/web/component.yaml); a local build
// falls back to the dev server.
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
