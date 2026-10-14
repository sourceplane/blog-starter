# blog-starter (BS) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place
the code departed from `design.md` or from the upstream template.

| Milestone | State | PR |
|---|---|---|
| BS0 — the spec | | |
| BS1 — the blog on Workers | | |
| BS2 — ready to instantiate | | |

## Departures from the upstream template

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
