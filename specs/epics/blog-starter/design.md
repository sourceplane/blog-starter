# blog-starter — design

## 1. What the template is

A statically generated blog. `_posts/*.md` are read with `fs` through
`src/lib/api.ts` (front matter by `gray-matter`, body rendered by
`remark` + `remark-html`), listed on `/` (hero post + more stories) and
rendered on `/posts/[slug]`. Tailwind 3 styling, a light/dark theme
switcher, Inter from `next/font/google`. No data source, no auth, no API.

## 2. The mapping (Vercel → Cloudflare)

| Vercel primitive the template uses | Here |
|---|---|
| Next.js hosting (SSG, App Router) | Cloudflare Workers + Static Assets; the Worker is `@opennextjs/cloudflare`'s output, assets bound as `ASSETS` |
| Build-time `fs` reads of `_posts` | Unchanged: `next build` runs on the build runner with the filesystem; every post is pre-rendered |
| Request-time render of an unknown slug | Not possible on a Worker (no `fs`); `dynamicParams = false` makes it a 404 |
| `next/font/google` | Unchanged: fonts are fetched at build time and served as static assets |
| Deploy on push | Orun: `apps/web/component.yaml` (`cloudflare-workers-assets-turbo`) deploys `blog-starter-web-{stage,prod}` on merge to `main` once the product is linked |

Alternative rejected: `output: "export"` + a static-assets-only Worker. It
would also work for this template, but it drops the App Router runtime the
rest of the catalog needs (route handlers, server actions, OG routes), and
the point of the port is a shape every later template can copy.

## 3. The repository

```
apps/web               the template (src/, _posts/, public/) + the Workers build
  component.yaml       Orun component: build with turbo, deploy with wrangler, smoke the home page
  wrangler.jsonc       worker name, nodejs_compat, ASSETS binding
  open-next.config.ts  in-memory cache defaults — the site binds nothing
tests/web              vitest: the posts loader and the markdown renderer
tooling/*              shared tsconfig / eslint / wrangler wiring renderer
intent.yaml            environments dev (verify) · stage · prod; `work:` points at specs/epics and tasks
.github/workflows      checks.yml (merge gate) · ci.yml (Orun lanes, gated by the ORUN_CI variable)
```

## 4. The build

`pnpm --filter @app/web build` = `next build` (standalone output, traced
from the monorepo root) then `opennextjs-cloudflare build --skipBuild`,
which emits `.open-next/worker.js` and `.open-next/assets/`. Locally,
`pnpm --filter @app/web preview` runs the same output under `wrangler dev`.

## 5. Out of scope

A CMS-backed variant (the `cms-*` examples), an RSS feed, OG image
generation and a custom-domain component. The portfolio-starter-kit port
carries the RSS/OG/sitemap shape; a domain is the owner's step (§6: the
brokered deploy token carries no zone permissions), and `SITE_URL` makes the
build use it.

## 6. The baseline (BS3)

The repository instantiates new blogs the way
[portfolio-starter-kit](https://github.com/sourceplane/portfolio-starter-kit)
does — itself built the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) instantiates
products: a console card (`blueprint.yaml`) the platform renders, a build
document (`repo-blueprint.yaml`) `orun new` runs, and a rename engine that
makes the copy somebody else's. The two repositories share every file outside
the app, so BS3 is portfolio-starter-kit's PK3 plus what its first live
bootstrap found (PK-5) — stack-tectonic 0.19.0, `checks.yml` on pull requests
only, the build origin written out — with the names changed and the
site-specific parts rewritten:

| portfolio-starter-kit | Here | Why |
|---|---|---|
| `apps/web/app/site.ts`: `SITE_NAME`, `SOURCE_URL`, `escapeXml` | `apps/web/src/lib/site.ts`: `SITE_NAME`, `SOURCE_URL`, `SITE_ORIGIN` | no feed to escape for; the origin is read where the metadata is |
| the site name in the heading, titles, OG card, RSS channel, JSON-LD | the header, the intro's heading, the title template, the OG card | the routes this template has |
| `NEXT_PUBLIC_SITE_URL` for sitemap, RSS, OG and JSON-LD links | `NEXT_PUBLIC_SITE_URL` as `metadataBase` | the posts' `ogImage.url` is relative; the origin makes it absolute |
| smoke: the nav's `/blog` link, `/rss` is a feed | smoke: the home page links a post, `/posts/hello-world` renders an `<article>` | the routes this template has |
| product name `My Portfolio` | `My Blog` | the rename replaces the name wherever it appears; a bare `Blog` would rewrite every use of the word |
| epic slug `portfolio-baselining` | `blog-baselining` | |

**The upstream link goes.** The footer and the post banner linked
`vercel/next.js/tree/canary/examples/blog-starter` through `EXAMPLE_PATH`.
That path is this repository's slug, so the rename would have pointed every
site's footer at `examples/<its-repo>` — a 404. Both now link `SOURCE_URL`,
the site's own repository, as portfolio-starter-kit's nav and footer do.

**Testing without the platform** is unchanged from portfolio-starter-kit:
`testing/placement.test.sh` places every phase offline and runs the
blueprint's own hooks; `testing/e2e.test.sh` builds, dry-deploys and serves
what that produced, runs the component's own smoke, and reads every route —
the heading and title carry the site's name, the footer links its
repository, each post's `og:image` is absolute on the stage origin, an
unknown post is a 404.
