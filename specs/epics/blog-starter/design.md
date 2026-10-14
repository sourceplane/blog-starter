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
generation and a custom domain. The portfolio-starter-kit port carries the
RSS/OG/sitemap shape; a domain is the `cloudflare-domain` Terraform root
the baseline already has.
