# blog-starter (BS) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place
the code departed from `design.md` or from the upstream template.

| Milestone | State | PR |
|---|---|---|
| BS0 — the spec | ✅ Shipped | [#1](https://github.com/sourceplane/blog-starter/pull/1) |
| BS1 — the blog on Workers | ✅ Shipped | [#2](https://github.com/sourceplane/blog-starter/pull/2) |
| BS2 — ready to instantiate | ✅ Shipped | [#3](https://github.com/sourceplane/blog-starter/pull/3) |
| BS3 — a baseline | 🟡 In review | this PR |

## Departures from the upstream template

### The site's name and source link live in `src/lib/site.ts` (BS3)

Upstream hard-codes "Blog" in the header and the intro, titles every page
"Next.js Blog Example with Markdown", and links the footer and the post banner
to the template's folder in `vercel/next.js` (`EXAMPLE_PATH`). All of them now
read `SITE_NAME` and `SOURCE_URL`, so the rename can make a copy somebody
else's in two literals; `EXAMPLE_PATH` is gone. Post titles are
`<post> | <site>` through the layout's title template, and `metadataBase` is
the site's origin (`NEXT_PUBLIC_SITE_URL`), so each post's Open Graph image is
absolute.

### `dynamicParams = false` on `posts/[slug]`

Upstream renders unknown slugs on demand (and errors on the missing file).
A Worker has no filesystem at request time, so every post is pre-rendered
and an unknown slug is a 404.

### `typeof localStorage.getItem === "function"` in the theme switcher

Node ≥ 25 exposes a `localStorage` global during `next build` (the Web
Storage API, unusable without `--localstorage-file`), so upstream's
`typeof localStorage !== "undefined"` guard let the prerender call a
non-function and fail. The guard now also checks for `getItem`. No change in
the browser.

## Verified

- Local: `pnpm typecheck`, `pnpm lint`, `pnpm test` (3 tests), `pnpm build`
  green; `wrangler dev` over `.open-next/worker.js`: `/` 200 (hero post and
  three stories), `/posts/hello-world` 200, `/posts/nope` 404, CSS chunk 200.
- CI: `Checks` green on #2 (install, wire, typecheck, lint, test, build).
- Not verified: a live deploy. `ci.yml` is gated until the product is linked
  to an Orun workspace with a Cloudflare connection.

## Verified (BS3)

- Locally, orun 2.75.0: `testing/{manifest,phases,coverage,rebrand,retouch,bootstrap-defer}.test.sh`,
  `testing/leak.test.sh`, `testing/placement.test.sh` (the offline bootstrap of
  `acme-blog`, "Sam's Notes & Links") and `testing/e2e.test.sh` (that site's
  Checks, its stage lane's build, verify and dry-run deploy in the staged tree,
  `wrangler dev`, the component's own smoke, every route) all green; the
  repository's own `pnpm typecheck`, `lint`, `test` (5 tests) and `build` green.
- Not verified: a live bootstrap (risks BS-F), and orun at the CI pins
  (v2.58.11 and v2.78.4) — Baseline CI runs both on this pull request.

## Versions

| Package | Version | Why |
|---|---|---|
| next | 16.3.8 | newest inside `@opennextjs/cloudflare` 1.20.11's peer range; 16.4.1 fails at worker boot (`preview-props.json` manifest) |
| @opennextjs/cloudflare | ^1.20.11 | static-assets incremental cache + `populateCache local` |
| wrangler | ^4.151.0 | compatibility_date 2026-10-01 |
